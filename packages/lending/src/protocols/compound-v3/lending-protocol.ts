import { BigNumber, providers } from 'ethers';
import { BorrowObject, Market, RepayParams, SupplyObject, SupplyParams, WithdrawParams } from 'src/protocol.type';
import { CometInterface } from './contracts/Comet';
import { Comet__factory } from './contracts';
import { MarketConfig, configMap, getMarketBaseConfig, marketMap, supportedChainIds } from './configs';
import { Portfolio } from 'src/protocol.portfolio';
import { Protocol } from 'src/protocol';
import { calcAPR } from './utils';
import * as common from '@protocolink/common';
import { isWrappedNativeToken, unwrapToken, wrapToken } from 'src/helper';
import * as logics from '@protocolink/logics';
import { protocols } from '@protocolink/api';

const NAME = 'compoundv3';
const displayName = 'Compound V3';

export class LendingProtocol extends Protocol {
  static readonly markets = supportedChainIds.reduce((accumulator, chainId) => {
    for (const marketId of Object.keys(marketMap[chainId])) {
      accumulator.push({ id: marketId, chainId });
    }
    return accumulator;
  }, [] as Market[]);

  readonly id = NAME;
  readonly market: Market;

  private marketMap: Record<number, Record<string, MarketConfig>> = supportedChainIds.reduce((accumulator, chainId) => {
    accumulator[chainId] = {};
    return accumulator;
  }, {} as Record<number, any>);

  async getMarket(id: string): Promise<MarketConfig> {
    if (this.marketMap[this.chainId][id]) return this.marketMap[this.chainId][id];

    const _market = getMarketBaseConfig(this.chainId, id);
    const { cometAddress } = _market;
    this.marketMap[this.chainId][id] = { ..._market, assets: [] };

    // assets
    // get assets address & price feed address
    const numAssets = await logics.compoundv3.Comet__factory.connect(cometAddress, this.provider).numAssets();
    const iface = logics.compoundv3.Comet__factory.createInterface();
    const calls: common.Multicall2.CallStruct[] = [];
    for (let i = 0; i < numAssets; i++) {
      calls.push({ target: cometAddress, callData: iface.encodeFunctionData('getAssetInfo', [i]) });
    }
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);
    for (let i = 0; i < numAssets; i++) {
      const [{ asset, priceFeed }] = iface.decodeFunctionResult('getAssetInfo', returnData[i]);
      const token = await this.getToken(asset);
      this.marketMap[this.chainId][id].assets.push({
        token,
        priceFeedAddress: priceFeed,
      });
    }

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
    return `${displayName} ${id}`;
  }

  canDebtSwap() {
    return false;
  }

  isProtocolToken(token: common.Token): boolean {
    console.log('token :>> ', token);
    const marketConfigs = configMap[this.chainId];
    // console.log('marketConfigs.markets :>> ', marketConfigs.markets);
    marketConfigs.markets.forEach(({ cometAddress }) => console.log('cometAddress :>> ', cometAddress));
    return !!marketConfigs.markets.find(({ cometAddress }) => {
      // console.log('cometAddress === token.address :>> ', cometAddress, token.address);
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
      if (isWrappedNativeToken(this.chainId, token)) continue;

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

    const portfolio = new Portfolio(this.chainId, this.id, marketId, supplies, borrows);

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
    if (params.input.token.unwrapped.is(baseToken)) {
      const supplyQuotation = await protocols.compoundv3.getSupplyBaseQuotation(this.chainId, {
        input: params.input,
        tokenOut: cToken,
        marketId: params.marketId,
      });
      return protocols.compoundv3.newSupplyBaseLogic({ ...supplyQuotation, balanceBps: common.BPS_BASE });
    } else {
      return protocols.compoundv3.newSupplyCollateralLogic({
        input: params.input,
        marketId: params.marketId,
        balanceBps: common.BPS_BASE,
      });
    }
  }

  async newWithdrawLogic(params: WithdrawParams) {
    const { cometAddress, baseToken } = getMarketBaseConfig(this.chainId, params.marketId);
    const cToken = await this.getToken(cometAddress);

    const realAmount = new common.TokenAmount(params.output.token, params.output.amount);
    realAmount.subWei(2);
    if (params.output.token.wrapped.is(baseToken)) {
      const withdrawBaseQuotation = await protocols.compoundv3.getWithdrawBaseQuotation(this.chainId, {
        input: {
          token: cToken,
          amount: realAmount.amount,
        },
        tokenOut: params.output.token,
        marketId: params.marketId,
      });
      const withdrawBaseLogic = await protocols.compoundv3.newWithdrawBaseLogic({
        ...withdrawBaseQuotation,
        balanceBps: common.BPS_BASE,
      });
      withdrawBaseLogic.fields.output.amount = realAmount.subWei(1).amount;
      return withdrawBaseLogic;
    } else {
      return protocols.compoundv3.newWithdrawCollateralLogic({ output: params.output, marketId: params.marketId });
    }
  }

  newBorrowLogic = protocols.compoundv3.newBorrowLogic;

  async newRepayLogic(params: RepayParams): Promise<any> {
    const repayQuotation = await protocols.compoundv3.getRepayQuotation(this.chainId, {
      tokenIn: params.input.token,
      borrower: params.borrower,
      marketId: params.marketId,
    });
    repayQuotation.input.amount = params.input.amount;
    return protocols.compoundv3.newRepayLogic(repayQuotation);
  }
}
