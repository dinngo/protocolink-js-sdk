import { ATokenInterface } from './contracts/AToken';
import {
  AToken__factory,
  PriceOracle,
  PriceOracle__factory,
  ProtocolDataProvider,
  ProtocolDataProvider__factory,
} from './contracts';
import {
  BorrowObject,
  BorrowParams,
  Market,
  RepayParams,
  SupplyObject,
  SupplyParams,
  WithdrawParams,
} from 'src/protocol.type';
import {
  DISPLAY_NAME,
  ID,
  configMap,
  getContractAddress,
  isRToken,
  supportedChainIds,
  toRToken,
  toToken,
  tokensForBorrowMap,
  tokensForDepositMap,
} from './configs';
import { Portfolio } from 'src/protocol.portfolio';
import { PriceOracleInterface } from './contracts/PriceOracle';
import { Protocol } from 'src/protocol';
import { ProtocolDataProviderInterface } from './contracts/ProtocolDataProvider';
import { RAY_DECIMALS, SECONDS_PER_YEAR, calculateCompoundedRate, normalize } from '@aave/math-utils';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';
import { providers } from 'ethers';

export class LendingProtocol extends Protocol {
  static readonly markets = supportedChainIds.map((chainId) => ({
    id: common.toNetworkId(chainId),
    chainId,
  }));

  readonly id = ID;
  readonly market: Market;
  readonly preferredFlashLoanProtocolId = logics.radiantv2.FlashLoanLogic.protocolId;

  constructor(chainId: number, provider?: providers.Provider) {
    super(chainId, provider);
    this.market = LendingProtocol.markets.find((market) => market.chainId === this.chainId)!;
  }

  private _protocolDataProvider?: ProtocolDataProvider;

  get protocolDataProvider() {
    if (!this._protocolDataProvider) {
      this._protocolDataProvider = ProtocolDataProvider__factory.connect(
        getContractAddress(this.chainId, 'ProtocolDataProvider'),
        this.provider
      );
    }
    return this._protocolDataProvider;
  }

  private _protocolDataProviderIface?: ProtocolDataProviderInterface;

  get protocolDataProviderIface() {
    if (!this._protocolDataProviderIface) {
      this._protocolDataProviderIface = ProtocolDataProvider__factory.createInterface();
    }
    return this._protocolDataProviderIface;
  }

  private _priceOracle?: PriceOracle;

  get priceOracle() {
    if (!this._priceOracle) {
      this._priceOracle = PriceOracle__factory.connect(getContractAddress(this.chainId, 'PriceOracle'), this.provider);
    }
    return this._priceOracle;
  }

  private _priceOracleIface?: PriceOracleInterface;

  get priceOracleIface() {
    if (!this._priceOracleIface) {
      this._priceOracleIface = PriceOracle__factory.createInterface();
    }
    return this._priceOracleIface;
  }

  private _aTokenIface?: ATokenInterface;

  get aTokenIface() {
    if (!this._aTokenIface) {
      this._aTokenIface = AToken__factory.createInterface();
    }
    return this._aTokenIface;
  }

  get reserves() {
    return configMap[this.chainId].reserves;
  }

  getMarketName() {
    return DISPLAY_NAME;
  }

  private _reserveDataMap?: Record<
    string,
    {
      ltv: string;
      liquidationThreshold: string;
      usageAsCollateralEnabled: boolean;
      supplyAPY: string;
      variableBorrowAPY: string;
      totalSupply: string;
      totalBorrow: string;
    }
  >;

  async getReserveDataMap() {
    if (!this._reserveDataMap) {
      const calls: common.Multicall3.CallStruct[] = [];
      for (const { asset, rToken } of this.reserves) {
        calls.push({
          target: this.protocolDataProvider.address,
          callData: this.protocolDataProviderIface.encodeFunctionData('getReserveConfigurationData', [
            asset.wrapped.address,
          ]),
        });
        calls.push({
          target: this.protocolDataProvider.address,
          callData: this.protocolDataProviderIface.encodeFunctionData('getReserveData', [asset.wrapped.address]),
        });
        calls.push({
          target: rToken.address,
          callData: this.aTokenIface.encodeFunctionData('totalSupply'),
        });
      }
      const { returnData } = await this.multicall3.callStatic.aggregate(calls, { blockTag: this.blockTag });

      this._reserveDataMap = {};
      let j = 0;
      for (const { asset } of this.reserves) {
        const { ltv, liquidationThreshold, usageAsCollateralEnabled } =
          this.protocolDataProviderIface.decodeFunctionResult('getReserveConfigurationData', returnData[j]);
        j++;
        const { liquidityRate, variableBorrowRate, totalVariableDebt } =
          this.protocolDataProviderIface.decodeFunctionResult('getReserveData', returnData[j]);
        j++;
        const [totalSupply] = this.aTokenIface.decodeFunctionResult('totalSupply', returnData[j]);
        j++;

        this._reserveDataMap[asset.address] = {
          ltv: common.toBigUnit(ltv, 4),
          liquidationThreshold: common.toBigUnit(liquidationThreshold, 4),
          usageAsCollateralEnabled,
          supplyAPY: normalize(
            calculateCompoundedRate({ rate: liquidityRate.toString(), duration: SECONDS_PER_YEAR }),
            RAY_DECIMALS
          ),
          variableBorrowAPY: normalize(
            calculateCompoundedRate({ rate: variableBorrowRate.toString(), duration: SECONDS_PER_YEAR }),
            RAY_DECIMALS
          ),
          totalSupply: common.toBigUnit(totalSupply, asset.decimals),
          totalBorrow: common.toBigUnit(totalVariableDebt, asset.decimals),
        };
      }
    }

    return this._reserveDataMap;
  }

  async getAssetPriceMap() {
    const assetAddresses = this.reserves.map(({ asset }) => asset.wrapped.address);
    const assetPrices = await this.priceOracle.getAssetsPrices(assetAddresses, { blockTag: this.blockTag });

    const assetPriceMap: Record<string, string> = {};
    for (let i = 0; i < this.reserves.length; i++) {
      assetPriceMap[this.reserves[i].asset.address] = common.toBigUnit(assetPrices[i], 8);
    }

    return assetPriceMap;
  }

  async getUserBalancesMap(account: string) {
    const calls: common.Multicall3.CallStruct[] = [];
    for (const { asset, rToken } of this.reserves) {
      calls.push({ target: rToken.address, callData: this.erc20Iface.encodeFunctionData('balanceOf', [account]) });
      calls.push({
        target: this.protocolDataProvider.address,
        callData: this.protocolDataProviderIface.encodeFunctionData('getUserReserveData', [
          asset.wrapped.address,
          account,
        ]),
      });
    }
    const { returnData } = await this.multicall3.callStatic.aggregate(calls, { blockTag: this.blockTag });

    const userBalancesMap: Record<
      string,
      { supplyBalance: string; variableBorrowBalance: string; usageAsCollateralEnabled: boolean }
    > = {};
    let j = 0;
    for (let i = 0; i < this.reserves.length; i++) {
      const { asset } = this.reserves[i];

      const [aTokenBalance] = this.erc20Iface.decodeFunctionResult('balanceOf', returnData[j]);
      j++;

      const { currentVariableDebt, usageAsCollateralEnabled } = this.protocolDataProviderIface.decodeFunctionResult(
        'getUserReserveData',
        returnData[j]
      );
      j++;

      userBalancesMap[asset.address] = {
        supplyBalance: common.toBigUnit(aTokenBalance, asset.decimals),
        variableBorrowBalance: common.toBigUnit(currentVariableDebt, asset.decimals),
        usageAsCollateralEnabled,
      };
    }

    return userBalancesMap;
  }

  async getPortfolios(account: string) {
    const reserveDataMap = await this.getReserveDataMap();
    const assetPriceMap = await this.getAssetPriceMap();
    const userBalancesMap = await this.getUserBalancesMap(account);

    const supplies: SupplyObject[] = [];
    for (const token of tokensForDepositMap[this.chainId]) {
      if (token.isWrapped) continue;

      const reserveData = reserveDataMap[token.address];
      const assetPrice = assetPriceMap[token.address];
      const userBalance = userBalancesMap[token.address];

      let usageAsCollateralEnabled = reserveData.usageAsCollateralEnabled;
      if (Number(userBalance.supplyBalance) > 0) {
        usageAsCollateralEnabled = userBalance.usageAsCollateralEnabled;
      }

      supplies.push({
        token,
        price: assetPrice,
        balance: userBalance.supplyBalance,
        apy: reserveData.supplyAPY,
        usageAsCollateralEnabled,
        ltv: reserveData.ltv,
        liquidationThreshold: reserveData.liquidationThreshold,
        totalSupply: reserveData.totalSupply,
      });
    }

    const borrows: BorrowObject[] = [];
    for (const token of tokensForBorrowMap[this.chainId]) {
      if (token.isWrapped) continue;

      const { variableBorrowAPY, totalBorrow } = reserveDataMap[token.address];
      const assetPrice = assetPriceMap[token.address];
      const { variableBorrowBalance } = userBalancesMap[token.address];

      borrows.push({
        token,
        price: assetPrice,
        balances: [variableBorrowBalance],
        apys: [variableBorrowAPY],
        totalBorrow,
      });
    }

    const portfolio = new Portfolio(this.chainId, this.id, this.market.id, supplies, borrows);

    return [portfolio];
  }

  async getPortfolio(account: string) {
    return this.getPortfolios(account).then((portfolios) => portfolios[0]);
  }

  toUnderlyingToken(_marketId: string, protocolToken: common.Token) {
    return toToken(this.chainId, protocolToken);
  }

  toProtocolToken(_marketId: string, underlyingToken: common.Token) {
    return toRToken(this.chainId, underlyingToken);
  }

  isProtocolToken(_marketId: string, token: common.Token) {
    return isRToken(this.chainId, token);
  }

  newSupplyLogic({ marketId, input }: SupplyParams) {
    return apisdk.protocols.radiantv2.newDepositLogic({
      input,
      output: new common.TokenAmount(this.toProtocolToken(marketId, input.token), input.amount),
    });
  }

  newWithdrawLogic({ marketId, output }: WithdrawParams) {
    return apisdk.protocols.radiantv2.newWithdrawLogic({
      input: new common.TokenAmount(this.toProtocolToken(marketId, output.token), output.amount),
      output,
    });
  }

  newBorrowLogic({ output }: BorrowParams) {
    return apisdk.protocols.radiantv2.newBorrowLogic({
      output,
      interestRateMode: logics.radiantv2.InterestRateMode.variable,
    });
  }

  newRepayLogic({ input, account }: RepayParams) {
    return apisdk.protocols.radiantv2.newRepayLogic({
      input,
      borrower: account,
      interestRateMode: logics.radiantv2.InterestRateMode.variable,
    });
  }
}
