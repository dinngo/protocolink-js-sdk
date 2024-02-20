import { ATokenInterface } from './contracts/AToken';
import {
  AToken__factory,
  AaveOracle,
  AaveOracle__factory,
  PoolDataProvider,
  PoolDataProvider__factory,
} from './contracts';
import { AaveOracleInterface } from './contracts/AaveOracle';
import { BigNumber, providers } from 'ethers';
import BigNumberJS from 'bignumber.js';
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
  Reserve,
  configMap,
  getContractAddress,
  hasNativeToken,
  isAToken,
  supportedChainIds,
  toAToken,
  toToken,
  tokensForBorrowMap,
  tokensForDepositMap,
} from './configs';
import { PoolDataProviderInterface } from './contracts/PoolDataProvider';
import { Portfolio } from 'src/protocol.portfolio';
import { Protocol } from 'src/protocol';
import { RAY_DECIMALS, SECONDS_PER_YEAR, calculateCompoundedRate, normalize } from '@aave/math-utils';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export class LendingProtocol extends Protocol {
  static readonly markets = supportedChainIds.map((chainId) => ({
    id: common.toNetworkId(chainId),
    chainId,
  }));

  readonly id = ID;
  readonly market: Market;

  constructor(chainId: number, provider?: providers.Provider) {
    super(chainId, provider);
    this.market = LendingProtocol.markets.find((market) => market.chainId === this.chainId)!;
  }

  private _poolDataProvider?: PoolDataProvider;

  get poolDataProvider() {
    if (!this._poolDataProvider) {
      this._poolDataProvider = PoolDataProvider__factory.connect(
        getContractAddress(this.chainId, 'PoolDataProvider'),
        this.provider
      );
    }
    return this._poolDataProvider;
  }

  private _poolDataProviderIface?: PoolDataProviderInterface;

  get poolDataProviderIface() {
    if (!this._poolDataProviderIface) {
      this._poolDataProviderIface = PoolDataProvider__factory.createInterface();
    }
    return this._poolDataProviderIface;
  }

  private _priceOracle?: AaveOracle;

  get priceOracle() {
    if (!this._priceOracle) {
      this._priceOracle = AaveOracle__factory.connect(getContractAddress(this.chainId, 'AaveOracle'), this.provider);
    }
    return this._priceOracle;
  }

  private _priceOracleIface?: AaveOracleInterface;

  get priceOracleIface() {
    if (!this._priceOracleIface) {
      this._priceOracleIface = AaveOracle__factory.createInterface();
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

  get reserves(): Reserve[] {
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
      stableBorrowAPY: string;
      variableBorrowAPY: string;
      liquidityIndex: BigNumberJS;
      debtCeiling: BigNumberJS;
      supplyCap: string;
      totalSupply: string;
      borrowCap: string;
      totalBorrow: string;
    }
  >;

  async getReserveDataMap() {
    if (!this._reserveDataMap) {
      const calls: common.Multicall3.CallStruct[] = [];
      for (const { asset } of this.reserves) {
        calls.push({
          target: this.poolDataProvider.address,
          callData: this.poolDataProviderIface.encodeFunctionData('getReserveConfigurationData', [
            asset.wrapped.address,
          ]),
        });
        calls.push({
          target: this.poolDataProvider.address,
          callData: this.poolDataProviderIface.encodeFunctionData('getReserveData', [asset.wrapped.address]),
        });
        calls.push({
          target: this.poolDataProvider.address,
          callData: this.poolDataProviderIface.encodeFunctionData('getReserveCaps', [asset.wrapped.address]),
        });
        calls.push({
          target: this.poolDataProvider.address,
          callData: this.poolDataProviderIface.encodeFunctionData('getDebtCeiling', [asset.wrapped.address]),
        });
      }
      const { returnData } = await this.multicall3.callStatic.aggregate(calls, { blockTag: this.blockTag });

      this._reserveDataMap = {};
      let j = 0;
      for (const { asset } of this.reserves) {
        const { ltv, liquidationThreshold, usageAsCollateralEnabled } = this.poolDataProviderIface.decodeFunctionResult(
          'getReserveConfigurationData',
          returnData[j]
        );
        j++;
        const {
          liquidityRate,
          variableBorrowRate,
          stableBorrowRate,
          liquidityIndex,
          totalAToken,
          totalVariableDebt,
          totalStableDebt,
        } = this.poolDataProviderIface.decodeFunctionResult('getReserveData', returnData[j]);
        j++;
        const { supplyCap, borrowCap } = this.poolDataProviderIface.decodeFunctionResult(
          'getReserveCaps',
          returnData[j]
        );
        j++;
        const [debtCeiling] = this.poolDataProviderIface.decodeFunctionResult('getDebtCeiling', returnData[j]);
        j++;

        this._reserveDataMap[asset.address] = {
          ltv: common.toBigUnit(ltv, 4),
          liquidationThreshold: common.toBigUnit(liquidationThreshold, 4),
          usageAsCollateralEnabled,
          supplyAPY: normalize(
            calculateCompoundedRate({ rate: liquidityRate.toString(), duration: SECONDS_PER_YEAR }),
            RAY_DECIMALS
          ),
          stableBorrowAPY: normalize(
            calculateCompoundedRate({ rate: stableBorrowRate.toString(), duration: SECONDS_PER_YEAR }),
            RAY_DECIMALS
          ),
          variableBorrowAPY: normalize(
            calculateCompoundedRate({ rate: variableBorrowRate.toString(), duration: SECONDS_PER_YEAR }),
            RAY_DECIMALS
          ),
          liquidityIndex,
          supplyCap: supplyCap.toString(),
          totalSupply: common.toBigUnit(totalAToken, asset.decimals),
          borrowCap: borrowCap.toString(),
          totalBorrow: common.toBigUnit(totalVariableDebt.add(totalStableDebt), asset.decimals),
          debtCeiling,
        };
      }
    }

    return this._reserveDataMap;
  }

  async getAssetPriceMap() {
    const assetAddresses = this.reserves.map(({ asset }) => asset.wrapped.address);
    const assetPrices = await this.priceOracle.getAssetsPrices(assetAddresses, { blockTag: this.blockTag });

    const assetPriceMap: Record<string, string> = {};
    for (let i = 0; i < assetAddresses.length; i++) {
      assetPriceMap[this.reserves[i].asset.address] = common.toBigUnit(assetPrices[i], 8);
    }

    return assetPriceMap;
  }

  async getUserBalancesMap(account: string) {
    const calls: common.Multicall3.CallStruct[] = [];
    for (const { asset, aToken } of this.reserves) {
      calls.push({
        target: aToken.address,
        callData: this.aTokenIface.encodeFunctionData('scaledBalanceOf', [account]),
      });
      calls.push({
        target: this.poolDataProvider.address,
        callData: this.poolDataProviderIface.encodeFunctionData('getUserReserveData', [asset.wrapped.address, account]),
      });
    }

    const { returnData } = await this.multicall3.callStatic.aggregate(calls, { blockTag: this.blockTag });

    const reserveDataMap = await this.getReserveDataMap();
    const userBalancesMap: Record<
      string,
      {
        supplyBalance: string;
        stableBorrowBalance: string;
        variableBorrowBalance: string;
        usageAsCollateralEnabled: boolean;
      }
    > = {};
    let j = 0;
    for (let i = 0; i < this.reserves.length; i++) {
      const { asset } = this.reserves[i];

      const { liquidityIndex } = reserveDataMap[asset.address];
      const [scaledBalance] = this.aTokenIface.decodeFunctionResult('scaledBalanceOf', returnData[j]);
      const aTokenBalance = scaledBalance.mul(liquidityIndex).div(BigNumber.from(10).pow(RAY_DECIMALS));
      j++;

      const { currentStableDebt, currentVariableDebt, usageAsCollateralEnabled } =
        this.poolDataProviderIface.decodeFunctionResult('getUserReserveData', returnData[j]);
      j++;

      userBalancesMap[asset.address] = {
        supplyBalance: common.toBigUnit(aTokenBalance, asset.decimals),
        stableBorrowBalance: common.toBigUnit(currentStableDebt, asset.decimals),
        variableBorrowBalance: common.toBigUnit(currentVariableDebt, asset.decimals),
        usageAsCollateralEnabled,
      };
    }

    return userBalancesMap;
  }

  // https://github.com/aave/interface/blob/release-2023-07-25_15-22/src/hooks/app-data-provider/useAppDataProvider.tsx#L228
  // https://github.com/aave/aave-v3-core/blob/v1.19.1/contracts/protocol/libraries/logic/GenericLogic.sol#L64
  async getPortfolios(account: string) {
    const reserveDataMap = await this.getReserveDataMap();
    const assetPriceMap = await this.getAssetPriceMap();
    const userBalancesMap = await this.getUserBalancesMap(account);

    const supplies: SupplyObject[] = [];
    for (const token of tokensForDepositMap[this.chainId]) {
      if (hasNativeToken(this.chainId) && token.isWrapped) continue;

      const reserveData = reserveDataMap[token.address];
      const { supplyAPY: apy, ltv, liquidationThreshold, supplyCap, totalSupply, debtCeiling } = reserveData;

      const price = assetPriceMap[token.address];

      const userBalances = userBalancesMap[token.address];
      const { supplyBalance: balance } = userBalances;

      // https://github.com/aave/interface/blob/release-2023-08-12_03-18/src/components/transactions/utils.ts#L61
      const usageAsCollateralEnabled = debtCeiling.gt(0)
        ? false
        : Number(balance) > 0
        ? userBalances.usageAsCollateralEnabled
        : reserveData.usageAsCollateralEnabled;

      supplies.push({
        token,
        price,
        balance,
        apy,
        usageAsCollateralEnabled,
        ltv,
        liquidationThreshold,
        supplyCap,
        totalSupply,
      });
    }

    const borrows: BorrowObject[] = [];
    for (const token of tokensForBorrowMap[this.chainId]) {
      if (hasNativeToken(this.chainId) && token.isWrapped) continue;

      const { stableBorrowAPY, variableBorrowAPY, borrowCap, totalBorrow } = reserveDataMap[token.address];
      const price = assetPriceMap[token.address];
      const { stableBorrowBalance, variableBorrowBalance } = userBalancesMap[token.address];

      borrows.push({
        token,
        price,
        balances: [variableBorrowBalance, stableBorrowBalance],
        apys: [variableBorrowAPY, stableBorrowAPY],
        borrowCap,
        totalBorrow,
      });
    }

    const portfolio = new Portfolio(this.chainId, this.id, this.market.id, supplies, borrows);

    return [portfolio];
  }

  async getPortfolio(account: string) {
    return this.getPortfolios(account).then((portfolios) => portfolios[0]);
  }

  override canLeverageByCollateral(_marketId: string, assetToken: common.Token) {
    return assetToken.symbol !== 'GHO';
  }

  toUnderlyingToken(_marketId: string, protocolToken: common.Token) {
    return toToken(this.chainId, protocolToken);
  }

  toProtocolToken(_marketId: string, underlyingToken: common.Token) {
    return toAToken(this.chainId, underlyingToken);
  }

  isProtocolToken(_marketId: string, token: common.Token) {
    return isAToken(this.chainId, token);
  }

  newSupplyLogic({ marketId, input }: SupplyParams) {
    return apisdk.protocols.aavev3.newSupplyLogic({
      input,
      output: new common.TokenAmount(this.toProtocolToken(marketId, input.token), input.amount),
    });
  }

  newWithdrawLogic({ marketId, output }: WithdrawParams) {
    return apisdk.protocols.aavev3.newWithdrawLogic({
      input: new common.TokenAmount(this.toProtocolToken(marketId, output.token), output.amount),
      output,
    });
  }

  newBorrowLogic({ output }: BorrowParams) {
    return apisdk.protocols.aavev3.newBorrowLogic({
      output,
      interestRateMode: logics.aavev3.InterestRateMode.variable,
    });
  }

  newRepayLogic({ input, account }: RepayParams) {
    return apisdk.protocols.aavev3.newRepayLogic({
      input,
      borrower: account,
      interestRateMode: logics.aavev3.InterestRateMode.variable,
    });
  }
}
