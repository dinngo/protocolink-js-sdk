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
  getContractAddress,
  isBorrowEnabled,
  isSupplyEnabled,
  supportedChainIds,
} from './configs';
import { PoolDataProviderInterface } from './contracts/PoolDataProvider';
import { Portfolio } from 'src/protocol.portfolio';
import { Protocol } from 'src/protocol';
import { RAY_DECIMALS, SECONDS_PER_YEAR, calculateCompoundedRate, normalize } from '@aave/math-utils';
import * as apisdk from '@protocolink/api';
import { calcBorrowGrossApy, calcSupplyGrossApy, getLstApyFromMap } from 'src/protocol.utils';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export class LendingProtocol extends Protocol {
  static readonly markets = supportedChainIds.map((chainId) => ({
    id: common.toNetworkId(chainId),
    chainId,
  }));

  readonly id = ID;
  readonly name = DISPLAY_NAME;
  readonly market: Market;

  private reserves: logics.spark.ReserveTokens[] = [];
  private reserveMap: Record<string, Reserve> = {};
  private hasNativeToken = false;

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
    const service = new logics.spark.Service(this.chainId, this.provider);
    const reserves = await service.getReserveTokens();
    const reserveMap: Record<string, Reserve> = {};
    let hasNativeToken = false;

    for (const { asset, aToken, stableDebtToken, variableDebtToken } of reserves) {
      if (asset.isNative) hasNativeToken = true;

      if (asset.isWrapped) {
        reserveMap[asset.unwrapped.address] = { aToken, asset };
        reserves.push({ asset: asset.unwrapped, aToken, stableDebtToken, variableDebtToken });
      }

      reserveMap[asset.address] = { aToken, asset };
      reserveMap[aToken.address] = { aToken, asset };
    }

    this.reserves = reserves;
    this.reserveMap = reserveMap;
    this.hasNativeToken = hasNativeToken;
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

  private _tokensForDeposit?: common.Token[];

  async getTokensForDeposit() {
    if (!this._tokensForDeposit) {
      const tokenList = await apisdk.protocols.spark.getSupplyTokenList(this.chainId);

      const tokens = tokenList.filter((tokens) => isSupplyEnabled(this.chainId, tokens[0])).map((tokens) => tokens[0]);

      this._tokensForDeposit = tokens;
    }

    return this._tokensForDeposit;
  }

  private _tokensForBorrow?: common.Token[];

  async getTokensForBorrow() {
    if (!this._tokensForBorrow) {
      const tokenList = await apisdk.protocols.spark.getBorrowTokenList(this.chainId);

      const tokens = tokenList.filter((token) => isBorrowEnabled(this.chainId, token));

      this._tokensForBorrow = tokens;
    }

    return this._tokensForBorrow;
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
      borrowAPY: string;
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
        const { liquidityRate, variableBorrowRate, liquidityIndex, totalAToken, totalVariableDebt, totalStableDebt } =
          this.poolDataProviderIface.decodeFunctionResult('getReserveData', returnData[j]);
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
          borrowAPY: normalize(
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
        borrowBalance: string;
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

      const { currentVariableDebt, usageAsCollateralEnabled } = this.poolDataProviderIface.decodeFunctionResult(
        'getUserReserveData',
        returnData[j]
      );
      j++;

      userBalancesMap[asset.address] = {
        supplyBalance: common.toBigUnit(aTokenBalance, asset.decimals),
        borrowBalance: common.toBigUnit(currentVariableDebt, asset.decimals),
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
    const lstTokenAPYMap = await this.getLstTokenAPYMap(this.chainId);
    const tokensForDeposit = await this.getTokensForDeposit();
    const tokensForBorrow = await this.getTokensForBorrow();

    const supplies: SupplyObject[] = [];
    for (const token of tokensForDeposit) {
      if (this.hasNativeToken && token.isWrapped) continue;

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

      const lstApy = getLstApyFromMap(token.address, lstTokenAPYMap);
      const grossApy = calcSupplyGrossApy(apy, lstApy);

      supplies.push({
        token,
        price,
        balance,
        apy,
        lstApy,
        grossApy,
        usageAsCollateralEnabled,
        ltv,
        liquidationThreshold,
        supplyCap,
        totalSupply,
      });
    }

    const borrows: BorrowObject[] = [];
    for (const token of tokensForBorrow) {
      if (this.hasNativeToken && token.isWrapped) continue;

      const { borrowAPY: apy, borrowCap, totalBorrow } = reserveDataMap[token.address];
      const price = assetPriceMap[token.address];
      const { borrowBalance: balance } = userBalancesMap[token.address];

      const lstApy = getLstApyFromMap(token.address, lstTokenAPYMap);
      const grossApy = calcBorrowGrossApy(apy, lstApy);

      borrows.push({
        token,
        price,
        balance,
        apy,
        lstApy,
        grossApy,
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

  toUnderlyingToken(_marketId: string, protocolToken: common.Token) {
    return this.reserveMap[protocolToken.address].asset;
  }

  toProtocolToken(_marketId: string, underlyingToken: common.Token) {
    return this.reserveMap[underlyingToken.address].aToken;
  }

  isProtocolToken(_marketId: string, token: common.Token) {
    return this.reserveMap[token.address].aToken.is(token);
  }

  newSupplyLogic({ marketId, input }: SupplyParams) {
    return apisdk.protocols.spark.newSupplyLogic({
      input,
      output: new common.TokenAmount(this.toProtocolToken(marketId, input.token), input.amount),
    });
  }

  newWithdrawLogic({ marketId, output }: WithdrawParams) {
    return apisdk.protocols.spark.newWithdrawLogic({
      input: new common.TokenAmount(this.toProtocolToken(marketId, output.token), output.amount),
      output,
    });
  }

  newBorrowLogic({ output }: BorrowParams) {
    return apisdk.protocols.spark.newBorrowLogic({
      output,
      interestRateMode: logics.spark.InterestRateMode.variable,
    });
  }

  newRepayLogic({ input, account }: RepayParams) {
    return apisdk.protocols.spark.newRepayLogic({
      input,
      borrower: account,
      interestRateMode: logics.spark.InterestRateMode.variable,
    });
  }
}
