import { ATokenInterface } from './contracts/AToken';
import {
  AToken__factory,
  AaveOracle,
  AaveOracle__factory,
  Multicall3,
  PoolDataProvider,
  PoolDataProvider__factory,
} from './contracts';
import { AaveOracleInterface } from './contracts/AaveOracle';
import { BigNumber, providers } from 'ethers';
import BigNumberJS from 'bignumber.js';
import { BorrowObject, Market, RepayParams, SupplyObject, SupplyParams, WithdrawParams } from 'src/protocol.types';
import { PoolDataProviderInterface } from './contracts/PoolDataProvider';
import { Portfolio } from 'src/protocol.portfolio';
import { Protocol } from 'src/protocol';
import { RAY_DECIMALS, SECONDS_PER_YEAR, calculateCompoundedRate, normalize } from '@aave/math-utils';
import {
  Reserve,
  configMap,
  getContractAddress,
  hasNativeToken,
  toAToken,
  toToken,
  tokensForBorrowMap,
  tokensForDepositMap,
} from './configs';
import * as common from '@protocolink/common';
import { isWrappedNativeToken, wrapToken } from 'src/helper';
import * as logics from '@protocolink/logics';
import { protocols } from '@protocolink/api';

const NAME = 'aavev3';
const displayName = 'Aave V3';
const supportedChainIds = [1];

export class LendingProtocol extends Protocol {
  static readonly markets = supportedChainIds.map((chainId) => ({
    id: common.toNetworkId(chainId),
    chainId,
  }));

  readonly id = NAME;
  readonly market: Market;
  readonly isAaveLike = true;

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
    return displayName;
  }

  private reserveDataMap?: Record<
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
    }
  >;

  async getReserveDataMap() {
    if (!this.reserveDataMap) {
      const calls: Multicall3.CallStruct[] = [];
      for (const { asset } of this.reserves) {
        const wrappedToken = wrapToken(this.chainId, asset);
        calls.push({
          target: this.poolDataProvider.address,
          callData: this.poolDataProviderIface.encodeFunctionData('getReserveConfigurationData', [
            wrappedToken.address,
          ]),
        });
        calls.push({
          target: this.poolDataProvider.address,
          callData: this.poolDataProviderIface.encodeFunctionData('getReserveData', [wrappedToken.address]),
        });
        calls.push({
          target: this.poolDataProvider.address,
          callData: this.poolDataProviderIface.encodeFunctionData('getDebtCeiling', [wrappedToken.address]),
        });
      }
      const { returnData } = await this.multicall2.callStatic.aggregate(calls);

      this.reserveDataMap = {};
      let j = 0;
      for (const { asset } of this.reserves) {
        const { ltv, liquidationThreshold, usageAsCollateralEnabled } = this.poolDataProviderIface.decodeFunctionResult(
          'getReserveConfigurationData',
          returnData[j]
        );
        j++;
        const { liquidityRate, variableBorrowRate, stableBorrowRate, liquidityIndex } =
          this.poolDataProviderIface.decodeFunctionResult('getReserveData', returnData[j]);
        j++;
        const [debtCeiling] = this.poolDataProviderIface.decodeFunctionResult('getDebtCeiling', returnData[j]);
        j++;

        this.reserveDataMap[asset.address] = {
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
          debtCeiling,
        };
      }
    }

    return this.reserveDataMap;
  }

  async getAssetPriceMap() {
    const assetAddresses = this.reserves.map(({ asset }) => wrapToken(this.chainId, asset).address);
    const assetPrices = await this.priceOracle.getAssetsPrices(assetAddresses);

    const assetPriceMap: Record<string, string> = {};
    for (let i = 0; i < assetAddresses.length; i++) {
      assetPriceMap[this.reserves[i].asset.address] = common.toBigUnit(assetPrices[i], 8);
    }

    return assetPriceMap;
  }

  async getUserBalancesMap(account: string) {
    const calls: Multicall3.CallStruct[] = [];
    for (const { asset, aToken } of this.reserves) {
      calls.push({
        target: aToken.address,
        callData: this.aTokenIface.encodeFunctionData('scaledBalanceOf', [account]),
      });
      calls.push({
        target: this.poolDataProvider.address,
        callData: this.poolDataProviderIface.encodeFunctionData('getUserReserveData', [
          wrapToken(this.chainId, asset).address,
          account,
        ]),
      });
    }

    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

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
      if (hasNativeToken(this.chainId) && isWrappedNativeToken(this.chainId, token)) continue;

      const reserveData = reserveDataMap[token.address];
      const { supplyAPY: apy, ltv, liquidationThreshold, debtCeiling } = reserveData;

      const price = assetPriceMap[token.address];

      const userBalances = userBalancesMap[token.address];
      const { supplyBalance: balance } = userBalances;

      // TODO: needs to match the Aave interface
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
      });
    }

    const borrows: BorrowObject[] = [];
    for (const token of tokensForBorrowMap[this.chainId]) {
      if (hasNativeToken(this.chainId) && isWrappedNativeToken(this.chainId, token)) continue;

      const { stableBorrowAPY, variableBorrowAPY } = reserveDataMap[token.address];
      const price = assetPriceMap[token.address];
      const { stableBorrowBalance, variableBorrowBalance } = userBalancesMap[token.address];

      borrows.push({
        token,
        price,
        balances: [variableBorrowBalance, stableBorrowBalance],
        apys: [variableBorrowAPY, stableBorrowAPY],
      });
    }

    const portfolio = new Portfolio(this.chainId, this.id, this.market.id, supplies, borrows);

    return [portfolio];
  }

  async getPortfolio(account: string, _marketId: string) {
    return (await this.getPortfolios(account))[0];
  }

  override canCollateralSwap() {
    return this.chainId !== common.ChainId.avalanche;
  }

  override canDebtSwap() {
    return this.chainId !== common.ChainId.avalanche;
  }

  override canLeverage(assetToken: common.Token) {
    return this.chainId !== common.ChainId.avalanche && assetToken.symbol !== 'GHO';
  }

  override canDeleverage() {
    return this.chainId !== common.ChainId.avalanche;
  }

  toUnderlyingToken(protocolToken: common.Token) {
    return toToken(this.chainId, protocolToken);
  }

  toProtocolToken(underlyingToken: common.Token) {
    return toAToken(this.chainId, underlyingToken);
  }

  async getSupplyQuotation(params: SupplyParams): Promise<logics.aavev3.SupplyLogicFields> {
    return protocols.aavev3.getSupplyQuotation(this.chainId, params);
  }
  newSupplyLogic = protocols.aavev3.newSupplyLogic;

  async getWithdrawQuotation(params: WithdrawParams): Promise<logics.aavev3.WithdrawLogicFields> {
    return protocols.aavev3.getWithdrawQuotation(this.chainId, params);
  }
  newWithdrawLogic = protocols.aavev3.newWithdrawLogic;

  newBorrowLogic = protocols.aavev3.newBorrowLogic;

  async getRepayQuotation(params: RepayParams): Promise<logics.aavev3.RepayLogicFields> {
    return protocols.aavev3.getRepayQuotation(this.chainId, params);
  }
  newRepayLogic = protocols.aavev3.newRepayLogic;
}
