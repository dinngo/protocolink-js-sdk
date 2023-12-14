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
import { CometInterface } from './contracts/Comet';
import { Comet__factory } from './contracts';
import {
  DISPLAY_NAME,
  ID,
  MarketConfig,
  configMap,
  getMarketBaseConfig,
  marketMap,
  supportedChainIds,
} from './configs';
import { Portfolio } from 'src/protocol.portfolio';
import { Protocol } from 'src/protocol';
import * as apisdk from '@protocolink/api';
import { calcAPR, calcHealthRate, calcNetAPR, calcUtilization } from './utils';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';
import { unwrapToken, wrapToken } from 'src/helper';

export class LendingProtocol extends Protocol {
  static readonly markets = supportedChainIds.reduce((accumulator, chainId) => {
    for (const marketId of Object.keys(marketMap[chainId])) {
      accumulator.push({ id: marketId, chainId });
    }
    return accumulator;
  }, [] as Market[]);

  readonly id = ID;
  readonly market: Market;

  toUnderlyingToken(protocolToken: common.Token): common.Token {
    const { baseToken } = marketMap[this.chainId][protocolToken.address];
    return baseToken;
  }

  toProtocolToken(underlyingToken: common.Token): common.Token {
    const { cometAddress } = getMarketBaseConfig(this.chainId, underlyingToken.unwrapped.symbol);
    return new common.Token(
      this.chainId,
      cometAddress,
      underlyingToken.decimals,
      `c${underlyingToken.wrapped.symbol}V3`,
      `Compound V3 ${underlyingToken.wrapped.symbol}`
    );
  }

  private marketMap: Record<number, Record<string, MarketConfig>> = supportedChainIds.reduce((accumulator, chainId) => {
    accumulator[chainId] = {};
    return accumulator;
  }, {} as Record<number, any>);

  async getMarket(id: string): Promise<MarketConfig> {
    if (this.marketMap[this.chainId][id]) return this.marketMap[this.chainId][id];

    const _market = getMarketBaseConfig(this.chainId, id);
    const { cometAddress } = _market;
    this.marketMap[this.chainId][id] = { ..._market, assets: [], baseBorrowMin: '0', utilization: '0', numAssets: 0 };

    // assets
    const iface = logics.compoundv3.Comet__factory.createInterface();

    let baseTokenPriceFeed: string;
    let numAssets: number;
    let utilization: BigNumber;
    let baseBorrowMinWei: BigNumber;
    {
      const calls: common.Multicall3.CallStruct[] = [
        {
          target: cometAddress,
          callData: iface.encodeFunctionData('baseTokenPriceFeed'),
        },
        {
          target: cometAddress,
          callData: iface.encodeFunctionData('numAssets'),
        },
        {
          target: cometAddress,
          callData: iface.encodeFunctionData('baseBorrowMin'),
        },
        {
          target: cometAddress,
          callData: iface.encodeFunctionData('getUtilization'),
        },
      ];
      const { returnData } = await this.multicall3.callStatic.aggregate(calls);

      [baseTokenPriceFeed] = iface.decodeFunctionResult('baseTokenPriceFeed', returnData[1]);
      [numAssets] = iface.decodeFunctionResult('numAssets', returnData[2]);
      [baseBorrowMinWei] = iface.decodeFunctionResult('baseBorrowMin', returnData[3]);
      [utilization] = iface.decodeFunctionResult('getUtilization', returnData[4]);
    }

    const calls: common.Multicall3.CallStruct[] = [];
    for (let i = 0; i < numAssets; i++) {
      calls.push({ target: cometAddress, callData: iface.encodeFunctionData('getAssetInfo', [i]) });
    }
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);
    for (let i = 0; i < numAssets; i++) {
      const [{ asset, priceFeed, borrowCollateralFactor, liquidateCollateralFactor }] = iface.decodeFunctionResult(
        'getAssetInfo',
        returnData[i]
      );
      const token = await this.getToken(asset);
      this.marketMap[this.chainId][id].assets.push({
        token,
        priceFeedAddress: priceFeed,
        borrowCollateralFactor: common.toBigUnit(borrowCollateralFactor, 18),
        liquidateCollateralFactor: common.toBigUnit(liquidateCollateralFactor, 18),
      });
    }

    this.marketMap[this.chainId][id].numAssets = numAssets;
    this.marketMap[this.chainId][id].utilization = utilization.toString();
    this.marketMap[this.chainId][id].baseTokenPriceFeedAddress = baseTokenPriceFeed;
    this.marketMap[this.chainId][id].baseBorrowMin = common.toBigUnit(
      baseBorrowMinWei,
      this.marketMap[this.chainId][id].baseToken.decimals
    );

    return this.marketMap[this.chainId][id];
  }

  constructor(chainId: number, provider?: providers.Provider) {
    super(chainId, provider);
    this.market = LendingProtocol.markets.find((market) => market.chainId === this.chainId)!;
  }

  private _cometIface?: CometInterface;

  get cometIface() {
    if (!this._cometIface) {
      this._cometIface = Comet__factory.createInterface();
    }
    return this._cometIface;
  }

  getMarketName(id: string) {
    return `${DISPLAY_NAME} ${id}`;
  }

  canDebtSwap() {
    return false;
  }

  isProtocolToken(token: common.Token): boolean {
    const marketConfigs = configMap[this.chainId];
    return !!marketConfigs.markets.find(({ cometAddress }) => {
      return cometAddress === token.address;
    });
  }

  canLeverageShort = false;

  async getAPYs(marketId: string) {
    const { cometAddress } = getMarketBaseConfig(this.chainId, marketId);

    const utilization = await Comet__factory.connect(cometAddress, this.provider).getUtilization();

    const calls: common.Multicall2.CallStruct[] = [
      { target: cometAddress, callData: this.cometIface.encodeFunctionData('getSupplyRate', [utilization]) },
      { target: cometAddress, callData: this.cometIface.encodeFunctionData('getBorrowRate', [utilization]) },
    ];
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);

    const [supplyRate] = this.cometIface.decodeFunctionResult('getSupplyRate', returnData[0]);
    const supplyAPR = calcAPR(supplyRate);

    const [borrowRate] = this.cometIface.decodeFunctionResult('getBorrowRate', returnData[1]);
    const borrowAPR = calcAPR(borrowRate);

    return { supplyAPR, borrowAPR };
  }

  async getPriceMap(marketId: string) {
    const { cometAddress, baseTokenPriceFeedAddress, baseTokenQuotePriceFeedAddress, assets } = await this.getMarket(
      marketId
    );

    const calls: common.Multicall2.CallStruct[] = [];
    if (baseTokenQuotePriceFeedAddress) {
      calls.push({
        target: cometAddress,
        callData: this.cometIface.encodeFunctionData('getPrice', [baseTokenQuotePriceFeedAddress]),
      });
    }
    calls.push({
      target: cometAddress,
      callData: this.cometIface.encodeFunctionData('getPrice', [baseTokenPriceFeedAddress]),
    });
    for (const { priceFeedAddress } of assets) {
      calls.push({
        target: cometAddress,
        callData: this.cometIface.encodeFunctionData('getPrice', [priceFeedAddress]),
      });
    }
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);

    let j = 0;

    let baseTokenQuotePrice: BigNumber | undefined;
    if (baseTokenQuotePriceFeedAddress) {
      [baseTokenQuotePrice] = this.cometIface.decodeFunctionResult('getPrice', returnData[j]);
      j++;
    }

    let price: BigNumber;
    [price] = this.cometIface.decodeFunctionResult('getPrice', returnData[j]);
    if (baseTokenQuotePrice) {
      price = price.mul(baseTokenQuotePrice).div(1e8);
    }
    const baseTokenPrice = common.toBigUnit(price, 8);
    j++;

    const assetPriceMap: Record<string, string> = {};
    for (const { token } of assets) {
      [price] = this.cometIface.decodeFunctionResult('getPrice', returnData[j]);
      if (baseTokenQuotePrice) {
        price = price.mul(baseTokenQuotePrice).div(1e8);
      }
      assetPriceMap[token.address] = common.toBigUnit(price, 8);
      j++;
    }

    return { baseTokenPrice, assetPriceMap };
  }

  async getAssetInfoMap(marketId: string) {
    const { cometAddress, assets } = await this.getMarket(marketId);

    const calls: common.Multicall2.CallStruct[] = assets.map(({ token }) => ({
      target: cometAddress,
      callData: this.cometIface.encodeFunctionData('getAssetInfoByAddress', [wrapToken(this.chainId, token).address]),
    }));
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);

    const assetInfoMap: Record<string, { borrowCollateralFactor: string; liquidateCollateralFactor: string }> = {};
    for (let i = 0; i < assets.length; i++) {
      const { token } = assets[i];
      const [{ borrowCollateralFactor, liquidateCollateralFactor }] = this.cometIface.decodeFunctionResult(
        'getAssetInfoByAddress',
        returnData[i]
      );
      assetInfoMap[token.address] = {
        borrowCollateralFactor: common.toBigUnit(borrowCollateralFactor, 18),
        liquidateCollateralFactor: common.toBigUnit(liquidateCollateralFactor, 18),
      };
    }

    return assetInfoMap;
  }

  async getUserBalances(marketId: string, account: string) {
    const { cometAddress, baseToken, assets } = await this.getMarket(marketId);

    const calls: common.Multicall3.CallStruct[] = [
      {
        target: cometAddress,
        callData: this.cometIface.encodeFunctionData('balanceOf', [account]),
      },
      {
        target: cometAddress,
        callData: this.cometIface.encodeFunctionData('borrowBalanceOf', [account]),
      },
    ];
    for (const { token } of assets) {
      calls.push({
        target: cometAddress,
        callData: this.cometIface.encodeFunctionData('collateralBalanceOf', [
          account,
          wrapToken(this.chainId, token).address,
        ]),
      });
    }
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);

    const [supplyBalanceWei] = this.cometIface.decodeFunctionResult('balanceOf', returnData[0]);
    const supplyBalance = common.toBigUnit(supplyBalanceWei, baseToken.decimals);

    const [borrowBalanceWei] = this.cometIface.decodeFunctionResult('borrowBalanceOf', returnData[1]);
    const borrowBalance = common.toBigUnit(borrowBalanceWei, baseToken.decimals);

    const collateralBalanceMap: Record<string, string> = {};
    for (let i = 0; i < assets.length; i++) {
      const { token } = assets[i];
      const [collateralBalanceWei] = this.cometIface.decodeFunctionResult('collateralBalanceOf', returnData[i + 2]);
      collateralBalanceMap[token.address] = common.toBigUnit(collateralBalanceWei, token.decimals);
    }

    return { supplyBalance, borrowBalance, collateralBalanceMap };
  }

  async getMarketInfo(marketId: string, account: string) {
    const { baseToken, numAssets, assets, baseBorrowMin } = await this.getMarket(marketId);
    const { baseTokenPrice, assetPriceMap } = await this.getPriceMap(marketId);
    const { supplyAPR, borrowAPR } = await this.getAPYs(marketId);
    const { supplyBalance, borrowBalance, collateralBalanceMap } = await this.getUserBalances(marketId, account);

    let supplyUSD = new BigNumberJS(0);
    let positiveProportion = new BigNumberJS(0);
    if (supplyBalance !== '0') {
      supplyUSD = new BigNumberJS(supplyBalance).times(baseTokenPrice);
      positiveProportion = supplyUSD.times(supplyAPR);
    }

    let borrowUSD = new BigNumberJS(0);
    let negativeProportion = new BigNumberJS(0);
    if (borrowBalance !== '0') {
      borrowUSD = new BigNumberJS(borrowBalance).times(baseTokenPrice);
      negativeProportion = borrowUSD.times(borrowAPR);
    }

    let totalCollateralUSD = new BigNumberJS(0);
    let totalBorrowCapacityUSD = new BigNumberJS(0);
    let liquidationLimit = new BigNumberJS(0);
    const collaterals = [];
    for (let i = 0; i < numAssets; i++) {
      const { token, borrowCollateralFactor, liquidateCollateralFactor } = assets[i];
      const assetPrice = assetPriceMap[i];

      const collateralBalance = collateralBalanceMap[i];

      let collateralUSD = new BigNumberJS(0);
      let borrowCapacityUSD = new BigNumberJS(0);
      let borrowCapacity = '0';
      if (collateralBalance !== '0') {
        collateralUSD = new BigNumberJS(collateralBalance).times(assetPrice);
        totalCollateralUSD = totalCollateralUSD.plus(collateralUSD);

        borrowCapacityUSD = collateralUSD.times(borrowCollateralFactor);
        totalBorrowCapacityUSD = totalBorrowCapacityUSD.plus(borrowCapacityUSD);
        borrowCapacity = common.formatBigUnit(borrowCapacityUSD.div(baseTokenPrice), baseToken.decimals, 'floor');
        liquidationLimit = liquidationLimit.plus(collateralUSD.times(liquidateCollateralFactor));
      }

      const collateralInfo = {
        asset: token.unwrapped,
        assetPrice,
        borrowCollateralFactor,
        liquidateCollateralFactor,
        collateralBalance,
        collateralUSD: common.formatBigUnit(collateralUSD, 2),
        borrowCapacity,
        borrowCapacityUSD: common.formatBigUnit(borrowCapacityUSD, 2),
      };

      collaterals.push(collateralInfo);
    }

    let borrowCapacity = new BigNumberJS('0');
    let availableToBorrow = new BigNumberJS('0');
    let availableToBorrowUSD = '0';
    if (!totalBorrowCapacityUSD.isZero()) {
      borrowCapacity = totalBorrowCapacityUSD
        .div(baseTokenPrice)
        .decimalPlaces(baseToken.decimals, BigNumberJS.ROUND_FLOOR);
      availableToBorrow = borrowCapacity.minus(borrowBalance);
      availableToBorrowUSD = common.formatBigUnit(availableToBorrow.times(baseTokenPrice), 2);
    }

    let liquidationThreshold = '0';
    let liquidationRisk = new BigNumberJS(0);
    let liquidationPointUSD = new BigNumberJS(0);
    let liquidationPoint = '0';
    if (!liquidationLimit.isZero()) {
      liquidationThreshold = common.formatBigUnit(liquidationLimit.div(totalCollateralUSD), 4);
      liquidationRisk = new BigNumberJS(borrowUSD).div(liquidationLimit).decimalPlaces(2);
      liquidationPointUSD = totalCollateralUSD.times(liquidationRisk);
      liquidationPoint = common.formatBigUnit(liquidationPointUSD.div(baseTokenPrice), baseToken.decimals, 'floor');
    }

    const utilization = calcUtilization(totalBorrowCapacityUSD, borrowUSD);
    const healthRate = calcHealthRate(totalCollateralUSD, borrowUSD, liquidationThreshold);
    const netAPR = calcNetAPR(supplyUSD, positiveProportion, borrowUSD, negativeProportion, totalCollateralUSD);

    const marketInfo = {
      baseToken: baseToken.unwrapped,
      baseTokenPrice,
      baseBorrowMin,
      supplyAPR,
      supplyBalance,
      supplyUSD: common.formatBigUnit(supplyUSD, 2),
      borrowAPR,
      borrowBalance,
      borrowUSD: common.formatBigUnit(borrowUSD, 2),
      collateralUSD: common.formatBigUnit(totalCollateralUSD, 2),
      borrowCapacity: borrowCapacity.toFixed(),
      borrowCapacityUSD: common.formatBigUnit(totalBorrowCapacityUSD, 2),
      availableToBorrow: availableToBorrow.toFixed(),
      availableToBorrowUSD,
      liquidationLimit: common.formatBigUnit(liquidationLimit, 2),
      liquidationThreshold,
      liquidationRisk: liquidationRisk.toFixed(),
      liquidationPoint,
      liquidationPointUSD: common.formatBigUnit(liquidationPointUSD, 2),
      utilization,
      healthRate,
      netAPR,
      collaterals,
    };

    return marketInfo;
  }

  async getPortfolio(account: string, marketId: string) {
    const { baseToken, assets } = await this.getMarket(marketId);

    const { supplyAPR, borrowAPR } = await this.getAPYs(marketId);
    const { baseTokenPrice, assetPriceMap } = await this.getPriceMap(marketId);
    const assetInfoMap = await this.getAssetInfoMap(marketId);
    const { supplyBalance, borrowBalance, collateralBalanceMap } = await this.getUserBalances(marketId, account);

    const supplies: SupplyObject[] = [
      {
        token: unwrapToken(this.chainId, baseToken),
        price: baseTokenPrice,
        balance: supplyBalance,
        apy: supplyAPR,
        usageAsCollateralEnabled: false,
        ltv: '0',
        liquidationThreshold: '0',
        isNotCollateral: true,
      },
    ];
    for (const { token } of assets) {
      // if (isWrappedNativeToken(this.chainId, token)) continue;

      const { borrowCollateralFactor, liquidateCollateralFactor } = assetInfoMap[token.address];
      supplies.push({
        token,
        price: assetPriceMap[token.address],
        balance: collateralBalanceMap[token.address],
        apy: '0',
        usageAsCollateralEnabled: true,
        ltv: borrowCollateralFactor,
        liquidationThreshold: liquidateCollateralFactor,
      });
    }

    const borrows: BorrowObject[] = [
      {
        token: unwrapToken(this.chainId, baseToken),
        price: baseTokenPrice,
        balances: [borrowBalance],
        apys: [borrowAPR],
      },
    ];

    const portfolio = new Portfolio(this.chainId, this.id, marketId, supplies, borrows, baseToken);

    return portfolio;
  }

  async getPortfolios(account: string) {
    return await Promise.all(
      Object.keys(marketMap[this.chainId]).map((marketId) => this.getPortfolio(account, marketId))
    );
  }

  async newSupplyLogic(params: SupplyParams) {
    const { cometAddress, baseToken } = getMarketBaseConfig(this.chainId, params.marketId);
    const cToken = await this.getToken(cometAddress);

    const userBalances = await this.getUserBalances(params.marketId, params.account);

    if (params.input.token.unwrapped.is(baseToken.unwrapped)) {
      if (new BigNumberJS(userBalances.borrowBalance)) {
        throw new Error('borrow USD is not zero');
      }
      const supplyQuotation = await apisdk.protocols.compoundv3.getSupplyBaseQuotation(this.chainId, {
        input: params.input,
        tokenOut: cToken,
        marketId: params.marketId,
      });
      return apisdk.protocols.compoundv3.newSupplyBaseLogic({ ...supplyQuotation, balanceBps: common.BPS_BASE });
    } else {
      return apisdk.protocols.compoundv3.newSupplyCollateralLogic({
        input: params.input,
        marketId: params.marketId,
        balanceBps: common.BPS_BASE,
      });
    }
  }

  async newWithdrawLogic(params: WithdrawParams) {
    const { cometAddress, baseToken } = getMarketBaseConfig(this.chainId, params.marketId);
    const cToken = await this.getToken(cometAddress);

    const userBalances = await this.getUserBalances(params.marketId, params.account);

    const realAmount = new common.TokenAmount(params.output.token, params.output.amount);
    realAmount.subWei(2);
    if (params.output.token.wrapped.is(baseToken)) {
      if (realAmount.gt(userBalances.supplyBalance)) {
        throw new Error('source amount is greater than available base amount');
      }
      const withdrawBaseQuotation = await apisdk.protocols.compoundv3.getWithdrawBaseQuotation(this.chainId, {
        input: {
          token: cToken,
          amount: realAmount.amount,
        },
        tokenOut: params.output.token,
        marketId: params.marketId,
      });
      const withdrawBaseLogic = await apisdk.protocols.compoundv3.newWithdrawBaseLogic({
        ...withdrawBaseQuotation,
        balanceBps: common.BPS_BASE,
      });
      withdrawBaseLogic.fields.output.amount = realAmount.subWei(1).amount;
      return withdrawBaseLogic;
    } else {
      if (realAmount.gt(userBalances.collateralBalanceMap[params.output.token.wrapped.address])) {
        throw new Error('source amount is greater than available collateral amount');
      }
      return apisdk.protocols.compoundv3.newWithdrawCollateralLogic({
        output: params.output,
        marketId: params.marketId,
      });
    }
  }

  async newBorrowLogic(params: BorrowParams) {
    const marketInfo = await this.getMarketInfo(params.marketId, params.account);
    if (new BigNumberJS(marketInfo.supplyUSD).isZero()) {
      throw new Error('supply USD is not zero');
    }
    if (new BigNumberJS(params.output.amount).gt(marketInfo.availableToBorrow)) {
      throw new Error('source amount is greater than available amount');
    }
    if (new BigNumberJS(marketInfo.borrowBalance).plus(params.output.amount).lt(marketInfo.baseBorrowMin)) {
      throw Error(`target borrow balance is less than baseBorrowMin: ${marketInfo.baseBorrowMin}`);
    }
    return apisdk.protocols.compoundv3.newBorrowLogic({ output: params.output, marketId: params.marketId });
  }

  async newRepayLogic(params: RepayParams): Promise<any> {
    const repayQuotation = await apisdk.protocols.compoundv3.getRepayQuotation(this.chainId, {
      tokenIn: params.input.token,
      borrower: params.borrower,
      marketId: params.marketId,
    });
    repayQuotation.input.amount = params.input.amount;
    return apisdk.protocols.compoundv3.newRepayLogic(repayQuotation);
  }
}
