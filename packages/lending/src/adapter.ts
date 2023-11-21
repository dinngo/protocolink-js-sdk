import { BaseFields, BaseParams } from './adapter.type';
import { Portfolio } from './protocol.portfolio';
import { Protocol, ProtocolClass } from './protocol';
import { Swaper, SwaperClass } from './swaper';
import * as api from '@protocolink/api';
import * as common from '@protocolink/common';
import { configMap } from './adapter.config';
import { defaultInterestRateMode, defaultSlippage } from './protocol.type';
import flatten from 'lodash/flatten';
import { isSameToken, wrapToken } from './helper';
import { protocols } from '@protocolink/api';
import { providers } from 'ethers';

type Options = {
  permitType: api.Permit2Type | undefined;
};
export class Adapter extends common.Web3Toolkit {
  static Protocols: ProtocolClass[] = [];

  static registerProtocol(protocol: ProtocolClass) {
    this.Protocols.push(protocol);
  }

  static Swapers: SwaperClass[] = [];

  static registerSwaper(swaper: SwaperClass) {
    this.Swapers.push(swaper);
  }

  permitType: api.Permit2Type | undefined = 'permit';
  protocolMap: Record<string, Protocol> = {};
  swapers: Swaper[] = [];

  constructor(chainId: number, provider: providers.Provider, { permitType }: Options = { permitType: 'permit' }) {
    super(chainId, provider);
    if (permitType) this.permitType = permitType;

    for (const Protocol of Adapter.Protocols) {
      if (Protocol.isSupported(this.chainId)) {
        const protocol = new Protocol(chainId, provider);
        this.protocolMap[protocol.id] = protocol;
      }
    }
    for (const Swaper of Adapter.Swapers) {
      if (Swaper.isSupported(this.chainId)) {
        this.swapers.push(new Swaper(chainId, provider));
      }
    }
  }

  get primaryStablecoin() {
    return configMap[this.chainId].primaryStablecoin;
  }

  get secondaryStablecoin() {
    return configMap[this.chainId].secondaryStablecoin;
  }

  get primaryNonstablecoin() {
    return configMap[this.chainId].primaryNonstablecoin;
  }

  get wrappedPrimaryNonstablecoin() {
    return wrapToken(this.chainId, this.primaryNonstablecoin);
  }

  chooseSuitableToken(options: {
    tokens: common.Token[];
    priorityToken?: common.Token;
    excludedToken?: common.Token;
    preferredTokens?: common.Token[];
  }) {
    const {
      tokens,
      priorityToken,
      excludedToken,
      preferredTokens = [
        this.primaryStablecoin,
        this.primaryNonstablecoin,
        this.wrappedPrimaryNonstablecoin,
        this.secondaryStablecoin,
      ],
    } = options;

    const tokenMap: Record<string, common.Token> = {};
    for (const token of tokens) {
      if (excludedToken && isSameToken(token, excludedToken)) continue;
      if (priorityToken && isSameToken(token, priorityToken)) {
        return token;
      }
      tokenMap[token.address] = token;
    }

    for (const token of preferredTokens) {
      if (tokenMap[token.address]) {
        return token;
      }
    }

    return Object.values(tokenMap)[0];
  }

  get protocolIds() {
    return Object.keys(this.protocolMap);
  }

  findSwaper(tokenOrTokens: common.Token | common.Token[]) {
    const canCustomTokenSwappers: Swaper[] = [];
    const tokensSupportedSwappers: Swaper[] = [];
    let bestSwaper: Swaper | undefined;
    for (const swaper of this.swapers) {
      if (swaper.canCustomToken) {
        canCustomTokenSwappers.push(swaper);
      }

      const isNotSupported = Array.isArray(tokenOrTokens)
        ? tokenOrTokens.some((token) => !swaper.isSupportedToken(token))
        : !swaper.isSupportedToken(tokenOrTokens);
      if (isNotSupported) {
        continue;
      }
      tokensSupportedSwappers.push(swaper);

      bestSwaper = swaper;
      break;
    }
    if (!bestSwaper) {
      bestSwaper = tokensSupportedSwappers[0] ?? canCustomTokenSwappers[0];
    }
    if (!bestSwaper) {
      bestSwaper = this.swapers[0];
    }

    return bestSwaper;
  }

  async getPortfolios(account: string): Promise<Portfolio[]> {
    const portfolios = await Promise.all(
      Object.values(this.protocolMap).map((protocol) => protocol.getPortfolios(account))
    );
    return flatten(portfolios);
  }

  async getPortfolio(account: string, protocolId: string, _marketId: string) {
    return await this.protocolMap[protocolId].getPortfolio(account, _marketId);
  }

  getProtocol(id: string) {
    return this.protocolMap[id];
  }

  // tokenA: USDC, tokenB: USDT
  // 1. flashloan USDC
  // 2. swap USDC to USDT
  // 3. deposit USDT, get aUSDT
  // 4. return-funds aUSDT to user
  // TODO: 5. add-funds aUSDC to router
  // 6. withdraw aUSDC, get USDC
  // 7. flashloan repay USDC
  async getCollateralSwap(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcToken, srcAmount, destToken } = params;
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);
    const collateralSwapLogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const liquidationThreshold = portfolio.liquidationThreshold;

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      repays: [{ token: wrappedSrcToken, amount: srcAmount }],
    });

    const flashLoanTokenAmount = flashLoanAggregatorQuotation.loans.tokenAmountMap[wrappedSrcToken.address];

    const [flashLoanLoanLogic, flashLoanRepayLogic] = protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    collateralSwapLogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swaper = this.findSwaper([wrappedSrcToken, wrappedDestToken]);
    const swapQuotation = await swaper.quote({
      input: flashLoanTokenAmount,
      tokenOut: wrappedDestToken,
      slippage: defaultSlippage,
    });

    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    collateralSwapLogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyLogic = await protocol.newSupplyLogic({ input: swapQuotation.output, marketId });

    collateralSwapLogics.push(supplyLogic);

    portfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // compound v3 base token supplied not support collateral swap
    if (protocolId === 'compoundv3' && supplyLogic.fields.output)
      throw new Error('Compound V3 does not support the base token for performing collateral swaps');

    // if not compound v3, compound v3 does not need return and add funds in collateral swap flow
    if (protocolId !== 'compoundv3') {
      if (!supplyLogic.fields.output) throw new Error('incorrect supply result');
      // ---------- return funds ----------
      const returnLogic = protocols.utility.newSendTokenLogic({
        input: supplyLogic.fields.output,
        recipient: account,
      });
      collateralSwapLogics.push(returnLogic);

      // ---------- add funds ----------
      // collateralSwapLogics.push(addLogic);
    }

    // ---------- withdraw ----------
    const withdrawLogic = await protocol.newWithdrawLogic({
      output: new common.TokenAmount(wrappedSrcToken, srcAmount),
      marketId,
    });
    collateralSwapLogics.push(withdrawLogic);

    portfolio.withdraw(wrappedSrcToken, srcAmount);

    // ---------- flashloan repay ----------
    collateralSwapLogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: collateralSwapLogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: collateralSwapLogics });

    return {
      fields: {
        srcToken: srcToken,
        srcAmount: srcAmount,
        destToken: destToken,
        destAmount: withdrawLogic.fields.output.amount,
        before: { healthRate, netAPY, liquidationThreshold },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          liquidationThreshold: portfolio.liquidationThreshold,
        },
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: collateralSwapLogics,
    };
  }

  // tokenA: USDC, tokenB: USDT
  // 1. flashloan USDT
  // 2. swap USDT to USDC
  // 3. repay USDC
  // 4. borrow USDT
  // 5. flashloan repay USDT
  async getDebtSwap(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcToken, srcAmount, destToken } = params;
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);

    const debtSwapLogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const liquidationThreshold = portfolio.liquidationThreshold;

    // ---------- Pre-calc quotation ----------
    const swaper = this.findSwaper([wrappedSrcToken, wrappedDestToken]);
    // get the quotation for how much dest token is needed to exchange for the src amount
    let swapQuotation = await swaper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
      slippage: defaultSlippage,
    });
    // convert swap type to exact in
    swapQuotation = await swaper.quote({ input: swapQuotation.input, tokenOut: srcToken, slippage: defaultSlippage });

    // ---------- flashloan ----------

    const flashLoanAggregatorQuotation = await protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [swapQuotation.input],
    });
    const [flashLoanLoanLogic, flashLoanRepayLogic] = protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    debtSwapLogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    debtSwapLogics.push(swapTokenLogic);

    // ---------- repay ----------
    const repayLogic = await protocol.newRepayLogic({
      input: swapQuotation.output,
      borrower: account,
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    debtSwapLogics.push(repayLogic);
    portfolio.repay(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- borrow ----------
    const borrowTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[wrappedDestToken.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
      interestRateMode: defaultInterestRateMode,
    });
    debtSwapLogics.push(borrowLogic);
    portfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    debtSwapLogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: debtSwapLogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: debtSwapLogics });

    return {
      fields: {
        srcToken: srcToken,
        srcAmount: srcAmount,
        destToken: destToken,
        destAmount: borrowTokenAmount.amount,
        before: { healthRate, netAPY, liquidationThreshold },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          liquidationThreshold: portfolio.liquidationThreshold,
        },
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: debtSwapLogics,
    };
  }

  // TODO: new SDK API to get max amount, otherwise user don't know how much he can long/short?
  // Leverage
  // tokenA: WBTC
  // 1. flashloan USDC
  // 2. swap USDC to WBTC
  // 3. deposit WBTC, get aWBTC
  // 4. return funds aWBTC to user
  // 5. borrow USDC
  // 6. flashloan repay USDC
  // * srcToken => depositToken, collateralToken
  // * destToken => flashloanToken, borrowToken
  async getLeverageLong(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcToken, srcAmount, destToken } = params;
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);

    const leverageLonglogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const liquidationThreshold = portfolio.liquidationThreshold;

    // ---------- Pre-calc quotation ----------
    const swaper = this.findSwaper([wrappedDestToken, wrappedSrcToken]);
    // retrieve the amount needed to borrow based on the collateral token and amount
    let swapQuotation = await swaper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
      slippage: defaultSlippage,
    });
    // convert swap type to exact in
    swapQuotation = await swaper.quote({
      input: swapQuotation.input,
      tokenOut: wrappedSrcToken,
      slippage: defaultSlippage,
    });

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [swapQuotation.input],
    });

    const [flashLoanLoanLogic, flashLoanRepayLogic] = protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );

    leverageLonglogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    leverageLonglogics.push(swapTokenLogic);

    // ---------- supply ----------
    // const aToken = toAToken(this.chainId, swapQuotation.output.token);
    // const supplyQuotation = await protocol.getSupplyQuotation({
    //   input: swapQuotation.output,
    //   tokenOut: aToken,
    // });

    const supplyLogic = await protocol.newSupplyLogic({ input: swapQuotation.output, marketId });
    leverageLonglogics.push(supplyLogic);
    portfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- return funds ----------
    // const returnLogic = protocols.utility.newSendTokenLogic({
    //   input: supplyQuotation.output,
    //   recipient: account,
    // });
    // leverageLonglogics.push(returnLogic);

    // ---------- borrow ----------
    const borrowTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[swapQuotation.input.token.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
      interestRateMode: defaultInterestRateMode,
    });
    leverageLonglogics.push(borrowLogic);

    portfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    leverageLonglogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: leverageLonglogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: leverageLonglogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        before: { healthRate, netAPY, liquidationThreshold },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          liquidationThreshold: portfolio.liquidationThreshold,
        },
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: leverageLonglogics,
    };
  }

  // tokenA: WBTC
  // 1. flashloan WBTC
  // 2. swap WBTC to USDC
  // 3. deposit USDC, get aUSDC
  // 4. return funds aWBTC to user
  // 5. borrow WBTC
  // 6. flashloan repay WBTC
  // * srcToken => flashloanToken, borrowToken
  // * destToken => depositToken, collateralToken
  async getLeverageShort(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcToken, srcAmount, destToken } = params;
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);
    const leverageShortlogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const liquidationThreshold = portfolio.liquidationThreshold;

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [{ token: wrappedSrcToken, amount: srcAmount }],
    });

    const flashLoanTokenAmount = flashLoanAggregatorQuotation.loans.tokenAmountMap[wrappedSrcToken.address];

    const [flashLoanLoanLogic, flashLoanRepayLogic] = protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    leverageShortlogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swaper = this.findSwaper([wrappedSrcToken, wrappedDestToken]);
    const swapQuotation = await swaper.quote({
      input: flashLoanTokenAmount,
      tokenOut: wrappedDestToken,
      slippage: defaultSlippage,
    });
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    leverageShortlogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyLogic = await protocol.newSupplyLogic({ input: swapQuotation.output, marketId });
    leverageShortlogics.push(supplyLogic);

    portfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- return funds ----------
    // const returnLogic = protocols.utility.newSendTokenLogic({
    //   input: supplyQuotation.output,
    //   recipient: account,
    // });
    // leverageShortlogics.push(returnLogic);

    // ---------- borrow ----------
    const borrowTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[wrappedSrcToken.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
      interestRateMode: defaultInterestRateMode,
    });
    leverageShortlogics.push(borrowLogic);

    portfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    leverageShortlogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: leverageShortlogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: leverageShortlogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        before: { healthRate, netAPY, liquidationThreshold },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          liquidationThreshold: portfolio.liquidationThreshold,
        },
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: leverageShortlogics,
    };
  }

  // tokenA: WBTC
  // 1. flashloan USDC
  // 2. swap USDC to WBTC
  // 3. repay WBTC
  // TODO: 4. add fund rUSDC
  // 5. withdraw USDC by rUSDC
  // 6. flashloan repay WBTC
  // * srcToken => repayToken
  // * destToken => depositToken, collateralToken
  async getDeleverage(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcToken, srcAmount, destToken } = params;
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);
    const deleveragelogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const liquidationThreshold = portfolio.liquidationThreshold;

    // ---------- Pre-calc quotation ----------
    const swaper = this.findSwaper([wrappedDestToken, wrappedSrcToken]);
    //  get the quotation for how much collateral token is needed to exchange for the repay amount
    let swapQuotation = await swaper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
      slippage: defaultSlippage,
    });
    // convert swap type to exact in
    swapQuotation = await swaper.quote({
      input: swapQuotation.input,
      tokenOut: wrappedSrcToken,
      slippage: defaultSlippage,
    });

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [swapQuotation.input],
    });

    const [flashLoanLoanLogic, flashLoanRepayLogic] = protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    deleveragelogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    deleveragelogics.push(swapTokenLogic);

    // ---------- repay ----------
    // const repayQuotation = await protocol.getRepayQuotation({
    //   tokenIn: swapQuotation.output.token,
    //   borrower: account,
    //   interestRateMode: defaultInterestRateMode,
    // });
    const repayLogic = await protocol.newRepayLogic({
      input: swapQuotation.output,
      borrower: account,
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    deleveragelogics.push(repayLogic);
    portfolio.repay(swapQuotation.output.token, swapQuotation.output.amount);

    // TODO:
    // ---------- add funds ----------
    // deleveragelogics.push(addLogic);

    // ---------- withdraw ----------
    const withdrawTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[wrappedDestToken.address];
    // const withdrawQuotation = await protocol.getWithdrawQuotation({
    //   input: { token: toAToken(this.chainId, wrappedDestToken), amount: withdrawTokenAmount.amount },
    //   tokenOut: wrappedDestToken,
    // });

    const withdrawLogic = await protocol.newWithdrawLogic({
      output: new common.TokenAmount(wrappedDestToken, withdrawTokenAmount.amount),
      marketId,
    });
    deleveragelogics.push(withdrawLogic);

    // ---------- flashloan repay ----------
    deleveragelogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: deleveragelogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: deleveragelogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: withdrawLogic.fields.output.amount,
        before: { healthRate, netAPY, liquidationThreshold },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          liquidationThreshold: portfolio.liquidationThreshold,
        },
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: deleveragelogics,
    };
  }

  async getZapSupply(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcToken, srcAmount, destToken } = params;
    const zapSupplylogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const utilization = portfolio.utilization;

    // ---------- swap ----------
    const swaper = this.findSwaper([srcToken, destToken]);
    const swapQuotation = await swaper.quote({
      input: { token: srcToken, amount: srcAmount },
      tokenOut: destToken,
      slippage: defaultSlippage,
    });
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    zapSupplylogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyLogic = await protocol.newSupplyLogic({
      input: swapQuotation.output,
      marketId,
    });
    zapSupplylogics.push(supplyLogic);

    portfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapSupplylogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapSupplylogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: swapQuotation.output.amount,
        before: { healthRate, netAPY, utilization },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          utilization: portfolio.utilization,
        },
      },
      logics: zapSupplylogics,
      estimateResult,
      buildRouterTransactionRequest,
    };
  }

  async getZapWithdraw(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcToken, srcAmount, destToken } = params;
    const zapWithdrawlogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const utilization = portfolio.utilization;

    // ---------- withdraw ----------
    const withdrawLogic = await protocol.newWithdrawLogic({
      output: new common.TokenAmount(srcToken, srcAmount),
      marketId,
    });
    zapWithdrawlogics.push(withdrawLogic);

    portfolio.withdraw(srcToken, withdrawLogic.fields.output.amount);

    // ---------- swap ----------
    const swaper = this.findSwaper([srcToken, destToken]);
    const swapQuotation = await swaper.quote({
      input: withdrawLogic.fields.output,
      tokenOut: destToken,
      slippage: defaultSlippage,
    });
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    zapWithdrawlogics.push(swapTokenLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapWithdrawlogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapWithdrawlogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: swapQuotation.output.amount,
        before: { healthRate, netAPY, utilization },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          utilization: portfolio.utilization,
        },
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: zapWithdrawlogics,
    };
  }

  async getZapBorrow(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcToken, srcAmount, destToken } = params;
    const zapBorrowlogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const totalBorrowUSD = portfolio.totalBorrowUSD.toString();
    const utilization = portfolio.utilization;

    // ---------- borrow ----------
    const borrowLogic = protocol.newBorrowLogic({
      output: { token: srcToken, amount: srcAmount },
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    zapBorrowlogics.push(borrowLogic);
    portfolio.borrow(srcToken, srcAmount);

    // ---------- swap ----------
    const swaper = this.findSwaper([srcToken, destToken]);
    const swapQuotation = await swaper.quote({
      input: { token: srcToken, amount: srcAmount },
      tokenOut: destToken,
      slippage: defaultSlippage,
    });

    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    zapBorrowlogics.push(swapTokenLogic);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapBorrowlogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapBorrowlogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: swapQuotation.output.amount,
        before: { healthRate, netAPY, utilization, totalBorrowUSD },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          utilization: portfolio.utilization,
          totalBorrowUSD: portfolio.totalBorrowUSD.toString(),
        },
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: zapBorrowlogics,
    };
  }

  async getZapRepay(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcToken, srcAmount, destToken } = params;
    const zapRepaylogics: api.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const totalBorrowUSD = portfolio.totalBorrowUSD.toString();
    const utilization = portfolio.utilization;

    // ---------- swap ----------
    const swaper = this.findSwaper([srcToken, destToken]);
    const swapQuotation = await swaper.quote({
      input: { token: srcToken, amount: srcAmount },
      tokenOut: destToken,
      slippage: defaultSlippage,
    });
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    zapRepaylogics.push(swapTokenLogic);

    // ---------- repay ----------
    const repayLogic = await protocol.newRepayLogic({
      borrower: account,
      interestRateMode: defaultInterestRateMode,
      input: new common.TokenAmount(swapQuotation.output.token, swapQuotation.output.amount),
      marketId,
    });

    zapRepaylogics.push(repayLogic);
    portfolio.repay(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- tx related ----------
    const estimateResult = await api.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapRepaylogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      api.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapRepaylogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: swapQuotation.output.amount,
        before: { healthRate, netAPY, utilization, totalBorrowUSD },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          utilization: portfolio.utilization,
          totalBorrowUSD: portfolio.totalBorrowUSD.toString(),
        },
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: zapRepaylogics,
    };
  }
}
