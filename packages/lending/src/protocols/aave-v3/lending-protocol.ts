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
import { DISPLAY_NAME, ID, ReserveMap, ReserveTokens, getContractAddress, supportedChainIds } from './configs';
import { PoolDataProviderInterface } from './contracts/PoolDataProvider';
import { Portfolio } from 'src/protocol.portfolio';
import { Protocol } from 'src/protocol';
import { RAY_DECIMALS, SECONDS_PER_YEAR, calculateCompoundedRate, normalize } from '@aave/math-utils';
import * as apisdk from '@protocolink/api';
import { calcBorrowGrossApy, calcSupplyGrossApy, fetchReservesData, getLstApyFromMap } from 'src/protocol.utils';
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

  private reserveTokens: ReserveTokens[] = [];
  private reserveMap: ReserveMap = {};
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
    let reserveTokens: ReserveTokens[] = [];

    try {
      reserveTokens = await this.getReserveTokensFromCache();
    } catch {
      reserveTokens = await this.getReserveTokens();
    }

    const reserveMap: ReserveMap = {};
    let hasNativeToken = false;

    for (const reserveToken of reserveTokens) {
      const { asset, aToken } = reserveToken;
      if (asset.isNative) hasNativeToken = true;

      if (asset.isWrapped) {
        reserveMap[asset.unwrapped.address] = reserveToken;
        reserveTokens.push({ ...reserveToken, asset: asset.unwrapped });
      }

      reserveMap[asset.address] = reserveToken;
      reserveMap[aToken.address] = reserveToken;
    }

    this.reserveTokens = reserveTokens;
    this.reserveMap = reserveMap;
    this.hasNativeToken = hasNativeToken;
  }

  async getReserveTokensFromCache(): Promise<ReserveTokens[]> {
    return await fetchReservesData(this.id, this.chainId);
  }

  async getReserveTokens() {
    const service = new logics.aavev3.Service(this.chainId, this.provider);
    const { reserveTokens } = await service.getReserveTokens();
    return reserveTokens;
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

  private _supplyTokenList?: common.Token[];

  async getSupplyTokenList() {
    if (!this._supplyTokenList) {
      const tokenList = await apisdk.protocols.aavev3.getSupplyTokenList(this.chainId);

      this._supplyTokenList = tokenList.map((tokens) => tokens[0]);
    }

    return this._supplyTokenList;
  }

  private _borrowTokenList?: common.Token[];

  async getBorrowTokenList() {
    if (!this._borrowTokenList) {
      this._borrowTokenList = await apisdk.protocols.aavev3.getBorrowTokenList(this.chainId);
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
      for (const { asset } of this.reserveTokens) {
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
      for (const { asset } of this.reserveTokens) {
        const { ltv, liquidationThreshold, usageAsCollateralEnabled } = this.poolDataProviderIface.decodeFunctionResult(
          'getReserveConfigurationData',
          returnData[j]
        );
        j++;
        const { liquidityRate, variableBorrowRate, liquidityIndex, totalAToken, totalVariableDebt } =
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
          totalBorrow: common.toBigUnit(totalVariableDebt, asset.decimals),
          debtCeiling,
        };
      }
    }

    return this._reserveDataMap;
  }

  async getAssetPriceMap() {
    const assetAddresses = this.reserveTokens.map(({ asset }) => asset.wrapped.address);
    const assetPrices = await this.priceOracle.getAssetsPrices(assetAddresses, { blockTag: this.blockTag });

    const assetPriceMap: Record<string, string> = {};
    for (let i = 0; i < assetAddresses.length; i++) {
      assetPriceMap[this.reserveTokens[i].asset.address] = common.toBigUnit(assetPrices[i], 8);
    }

    return assetPriceMap;
  }

  async getUserBalancesMap(account: string) {
    const calls: common.Multicall3.CallStruct[] = [];
    for (const { asset, aToken } of this.reserveTokens) {
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
    for (let i = 0; i < this.reserveTokens.length; i++) {
      const { asset } = this.reserveTokens[i];

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
    const supplyTokenList = await this.getSupplyTokenList();
    const borrowTokenList = await this.getBorrowTokenList();

    const supplies: SupplyObject[] = [];

    for (const token of supplyTokenList) {
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
    for (const token of borrowTokenList) {
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

  async getProtocolInfos() {
    const reserveTokens = await this.getReserveTokens();

    return [
      {
        chainId: this.chainId,
        protocolId: this.id,
        marketId: this.market.id,
        reserveTokens,
      },
    ];
  }

  override canLeverageByCollateral(_marketId: string, assetToken: common.Token) {
    return assetToken.symbol !== 'GHO';
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
