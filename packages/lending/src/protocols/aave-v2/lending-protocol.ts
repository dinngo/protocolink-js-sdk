import { ATokenInterface } from './contracts/AToken';
import {
  AToken__factory,
  ETHPriceFeed,
  ETHPriceFeed__factory,
  PriceOracle,
  PriceOracle__factory,
  ProtocolDataProvider,
  ProtocolDataProvider__factory,
} from './contracts';
import { BigNumber, providers } from 'ethers';
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
import { ETHPriceFeedInterface } from './contracts/ETHPriceFeed';
import { Portfolio } from 'src/protocol.portfolio';
import { PriceOracleInterface } from './contracts/PriceOracle';
import { Protocol } from 'src/protocol';
import { ProtocolDataProviderInterface } from './contracts/ProtocolDataProvider';
import { RAY_DECIMALS, SECONDS_PER_YEAR, calculateCompoundedRate, normalize } from '@aave/math-utils';
import * as apisdk from '@protocolink/api';
import { calcBorrowGrossApy, calcSupplyGrossApy, fetchReservesData, getLstApyFromMap } from 'src/protocol.utils';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export class LendingProtocol extends Protocol {
  static readonly markets = supportedChainIds.map((chainId) => ({
    id: common.toNetworkId(chainId),
    name: common.getNetwork(chainId).name,
    chainId,
  }));

  readonly id = ID;
  readonly name = DISPLAY_NAME;
  readonly market: Market;

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
    let reserveTokens: ReserveTokens[] = [];

    try {
      reserveTokens = await this.getReserveTokensFromCache();
    } catch {
      reserveTokens = await this.getReserveTokens();
    }

    const reserveMap: ReserveMap = {};

    for (const reserveToken of reserveTokens) {
      const { asset, aToken } = reserveToken;

      if (asset.isWrapped) {
        reserveMap[asset.unwrapped.address] = reserveToken;
        reserveTokens.push({ ...reserveToken, asset: asset.unwrapped });
      }

      reserveMap[asset.address] = reserveToken;
      reserveMap[aToken.address] = reserveToken;
    }

    this.reserveTokens = reserveTokens;
    this.reserveMap = reserveMap;
  }

  async getReserveTokensFromCache(): Promise<ReserveTokens[]> {
    return await fetchReservesData(this.id, this.chainId);
  }

  async getReserveTokens() {
    const service = new logics.aavev2.Service(this.chainId, this.provider);
    const { reserveTokens } = await service.getReserveTokens();
    return reserveTokens;
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

  private _ethPriceFeed?: ETHPriceFeed;

  get ethPriceFeed() {
    if (!this._ethPriceFeed) {
      this._ethPriceFeed = ETHPriceFeed__factory.connect(
        getContractAddress(this.chainId, 'ETHPriceFeed'),
        this.provider
      );
    }
    return this._ethPriceFeed;
  }

  private _priceFeedIface?: ETHPriceFeedInterface;

  get ethPriceFeedIface() {
    if (!this._priceFeedIface) {
      this._priceFeedIface = ETHPriceFeed__factory.createInterface();
    }
    return this._priceFeedIface;
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
      const tokenList = await apisdk.protocols.aavev2.getDepositTokenList(this.chainId);

      this._depositTokenList = tokenList.map((tokens) => tokens[0]);
    }

    return this._depositTokenList;
  }

  private _borrowTokenList?: common.Token[];

  async getBorrowTokenList() {
    if (!this._borrowTokenList) {
      this._borrowTokenList = await apisdk.protocols.aavev2.getBorrowTokenList(this.chainId);
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
      totalSupply: string;
      totalBorrow: string;
    }
  >;

  async getReserveDataMap() {
    if (!this._reserveDataMap) {
      const calls: common.Multicall3.CallStruct[] = [];
      for (const { asset, aToken } of this.reserveTokens) {
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
          target: aToken.address,
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
          borrowAPY: normalize(
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
    const calls: common.Multicall3.CallStruct[] = [
      {
        target: this.ethPriceFeed.address,
        callData: this.ethPriceFeedIface.encodeFunctionData('latestAnswer'),
      },
      {
        target: this.priceOracle.address,
        callData: this.priceOracleIface.encodeFunctionData('getAssetsPrices', [
          this.reserveTokens.map(({ asset }) => asset.wrapped.address),
        ]),
      },
    ];
    const { returnData } = await this.multicall3.callStatic.aggregate(calls, { blockTag: this.blockTag });

    const [ethPrice] = this.ethPriceFeedIface.decodeFunctionResult('latestAnswer', returnData[0]);
    const [assetPrices] = this.priceOracleIface.decodeFunctionResult('getAssetsPrices', returnData[1]);

    const assetPriceMap: Record<string, string> = {};
    for (let i = 0; i < this.reserveTokens.length; i++) {
      assetPriceMap[this.reserveTokens[i].asset.address] = common.toBigUnit(
        ethPrice.mul(assetPrices[i]).div(BigNumber.from(10).pow(18)),
        8
      );
    }

    return assetPriceMap;
  }

  async getUserBalancesMap(account: string) {
    const calls: common.Multicall3.CallStruct[] = [];
    for (const { asset, aToken } of this.reserveTokens) {
      calls.push({ target: aToken.address, callData: this.erc20Iface.encodeFunctionData('balanceOf', [account]) });
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
      {
        supplyBalance: string;
        borrowBalance: string;
        usageAsCollateralEnabled: boolean;
      }
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
        borrowBalance: common.toBigUnit(currentVariableDebt, asset.decimals),
        usageAsCollateralEnabled,
      };
    }

    return userBalancesMap;
  }

  // https://github.com/aave/interface/blob/release-2023-07-25_15-22/src/hooks/app-data-provider/useAppDataProvider.tsx#L228
  // https://github.com/aave/protocol-v2/blob/master/contracts/protocol/libraries/logic/GenericLogic.sol#L150
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
      if (!reserveData) continue;

      const {
        usageAsCollateralEnabled: _usageAsCollateralEnabled,
        supplyAPY: apy,
        ltv,
        liquidationThreshold,
        totalSupply,
      } = reserveData;

      const price = assetPriceMap[token.address];

      const { supplyBalance: balance, usageAsCollateralEnabled: userUsageAsCollateralEnabled } =
        userBalancesMap[token.address];

      const usageAsCollateralEnabled =
        Number(balance) > 0 ? _usageAsCollateralEnabled && userUsageAsCollateralEnabled : _usageAsCollateralEnabled;

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
        totalSupply,
      });
    }

    const borrows: BorrowObject[] = [];
    for (const token of borrowTokenList) {
      if (token.isWrapped) continue;

      const reserveData = reserveDataMap[token.address];
      if (!reserveData) continue;

      const { supplyAPY: apy, totalBorrow } = reserveData;
      const price = assetPriceMap[token.address];
      const { borrowBalance: balance } = userBalancesMap[token.address];

      const lstApy = getLstApyFromMap(token.address, lstTokenAPYMap);
      const grossApy = calcBorrowGrossApy(apy, lstApy);

      borrows.push({ token, price, balance, apy, lstApy, grossApy, totalBorrow });
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
    return apisdk.protocols.aavev2.newDepositLogic({
      input,
      output: new common.TokenAmount(this.toProtocolToken(marketId, input.token), input.amount),
    });
  }

  newWithdrawLogic({ marketId, output }: WithdrawParams) {
    return apisdk.protocols.aavev2.newWithdrawLogic({
      input: new common.TokenAmount(this.toProtocolToken(marketId, output.token), output.amount),
      output,
    });
  }

  newBorrowLogic({ output }: BorrowParams) {
    return apisdk.protocols.aavev2.newBorrowLogic({
      output,
      interestRateMode: logics.aavev2.InterestRateMode.variable,
    });
  }

  newRepayLogic({ input, account }: RepayParams) {
    return apisdk.protocols.aavev2.newRepayLogic({
      input,
      borrower: account,
      interestRateMode: logics.aavev2.InterestRateMode.variable,
    });
  }
}
