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
import { DISPLAY_NAME, ID, ReserveMap, ReserveTokens, getContractAddress, supportedChainIds } from './configs';
import { Portfolio } from 'src/protocol.portfolio';
import { PriceOracleInterface } from './contracts/PriceOracle';
import { Protocol } from 'src/protocol';
import { ProtocolDataProviderInterface } from './contracts/ProtocolDataProvider';
import { RAY_DECIMALS, SECONDS_PER_YEAR, calculateCompoundedRate, normalize } from '@aave/math-utils';
import * as apisdk from '@protocolink/api';
import { calcBorrowGrossApy, calcSupplyGrossApy, getLstApyFromMap } from 'src/protocol.utils';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';
import { providers } from 'ethers';

export class LendingProtocol extends Protocol {
  static readonly markets = supportedChainIds.map((chainId) => ({
    id: common.toNetworkId(chainId),
    chainId,
  }));

  readonly id = ID;
  readonly name = DISPLAY_NAME;
  readonly market: Market;
  readonly preferredFlashLoanProtocolId = logics.radiantv2.FlashLoanLogic.protocolId;

  private reserveTokens: ReserveTokens[] = [];
  private reserveMap: ReserveMap = {};

  constructor(chainId: number, provider?: providers.Provider) {
    super(chainId, provider);
    this.market = LendingProtocol.markets.find((market) => market.chainId === this.chainId)!;
  }

  public static async createProtocol(chainId: number, provider?: providers.Provider): Promise<LendingProtocol> {
    const instance = new LendingProtocol(chainId, provider);
    await instance.initializeReservesConfig();
    return instance;
  }

  async initializeReservesConfig() {
    const service = new logics.radiantv2.Service(this.chainId, this.provider);
    const { reserveTokens } = await service.getReserveTokens();

    const reserveMap: ReserveMap = {};

    for (const reserveToken of reserveTokens) {
      const { asset, rToken } = reserveToken;

      if (asset.isWrapped) {
        reserveMap[asset.unwrapped.address] = reserveToken;
        reserveTokens.push({ ...reserveToken, asset: asset.unwrapped });
      }

      reserveMap[asset.address] = reserveToken;
      reserveMap[rToken.address] = reserveToken;
    }

    this.reserveTokens = reserveTokens;
    this.reserveMap = reserveMap;
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

  private _depositTokenList?: common.Token[];

  async getDepositTokenList() {
    if (!this._depositTokenList) {
      const tokenList = await apisdk.protocols.radiantv2.getDepositTokenList(this.chainId);

      this._depositTokenList = tokenList.map((tokens) => tokens[0]);
    }

    return this._depositTokenList;
  }

  private _borrowTokenList?: common.Token[];

  async getBorrowTokenList() {
    if (!this._borrowTokenList) {
      this._borrowTokenList = await apisdk.protocols.radiantv2.getBorrowTokenList(this.chainId);
    }

    return this._borrowTokenList;
  }

  getMarketName() {
    return this.market.id;
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
      for (const { asset, rToken } of this.reserveTokens) {
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
      for (const { asset } of this.reserveTokens) {
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
    const assetAddresses = this.reserveTokens.map(({ asset }) => asset.wrapped.address);
    const assetPrices = await this.priceOracle.getAssetsPrices(assetAddresses, { blockTag: this.blockTag });

    const assetPriceMap: Record<string, string> = {};
    for (let i = 0; i < this.reserveTokens.length; i++) {
      assetPriceMap[this.reserveTokens[i].asset.address] = common.toBigUnit(assetPrices[i], 8);
    }

    return assetPriceMap;
  }

  async getUserBalancesMap(account: string) {
    const calls: common.Multicall3.CallStruct[] = [];
    for (const { asset, rToken } of this.reserveTokens) {
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
    for (let i = 0; i < this.reserveTokens.length; i++) {
      const { asset } = this.reserveTokens[i];

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
    const lstTokenAPYMap = await this.getLstTokenAPYMap(this.chainId);
    const depositTokenList = await this.getDepositTokenList();
    const borrowTokenList = await this.getBorrowTokenList();

    const supplies: SupplyObject[] = [];
    for (const token of depositTokenList) {
      if (token.isWrapped) continue;

      const reserveData = reserveDataMap[token.address];
      const assetPrice = assetPriceMap[token.address];
      const userBalance = userBalancesMap[token.address];

      let usageAsCollateralEnabled = reserveData.usageAsCollateralEnabled;
      if (Number(userBalance.supplyBalance) > 0) {
        usageAsCollateralEnabled = userBalance.usageAsCollateralEnabled;
      }

      const lstApy = getLstApyFromMap(token.address, lstTokenAPYMap);
      const grossApy = calcSupplyGrossApy(reserveData.supplyAPY, lstApy);

      supplies.push({
        token,
        price: assetPrice,
        balance: userBalance.supplyBalance,
        apy: reserveData.supplyAPY,
        lstApy,
        grossApy,
        usageAsCollateralEnabled,
        ltv: reserveData.ltv,
        liquidationThreshold: reserveData.liquidationThreshold,
        totalSupply: reserveData.totalSupply,
      });
    }

    const borrows: BorrowObject[] = [];
    for (const token of borrowTokenList) {
      if (token.isWrapped) continue;

      const { variableBorrowAPY: apy, totalBorrow } = reserveDataMap[token.address];
      const price = assetPriceMap[token.address];
      const { variableBorrowBalance: balance } = userBalancesMap[token.address];

      const lstApy = getLstApyFromMap(token.address, lstTokenAPYMap);
      const grossApy = calcBorrowGrossApy(apy, lstApy);

      borrows.push({
        token,
        price,
        balance,
        apy,
        lstApy,
        grossApy,
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
    return this.reserveMap[protocolToken.address].asset;
  }

  toProtocolToken(_marketId: string, underlyingToken: common.Token) {
    return this.reserveMap[underlyingToken.address].rToken;
  }

  isProtocolToken(_marketId: string, token: common.Token) {
    return this.reserveMap[token.address].rToken.is(token);
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
