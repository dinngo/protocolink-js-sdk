import { BaseFields, BaseParams } from './adapter.type';
import { Portfolio } from './protocol.portfolio';
import { Protocol, ProtocolClass } from './protocol';
import { Swapper, SwapperClass } from './swapper';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import { defaultInterestRateMode, defaultSlippage } from './protocol.type';
import flatten from 'lodash/flatten';
import { providers } from 'ethers';

type Options = {
  permitType: apisdk.Permit2Type | undefined;
  apiKey?: string | undefined;
};
export class Adapter extends common.Web3Toolkit {
  static Protocols: ProtocolClass[] = [];

  static registerProtocol(protocol: ProtocolClass) {
    this.Protocols.push(protocol);
  }

  static Swappers: SwapperClass[] = [];

  static registerSwapper(swapper: SwapperClass) {
    this.Swappers.push(swapper);
  }

  permitType: apisdk.Permit2Type | undefined = 'permit';
  apiKey: string | undefined;
  protocolMap: Record<string, Protocol> = {};
  swappers: Swapper[] = [];

  constructor(
    chainId: number,
    provider: providers.Provider,
    { permitType, apiKey }: Options = { permitType: 'permit' }
  ) {
    super(chainId, provider);
    if (permitType) this.permitType = permitType;
    if (apiKey) this.apiKey = apiKey;

    for (const Protocol of Adapter.Protocols) {
      if (Protocol.isSupported(this.chainId)) {
        const protocol = new Protocol(chainId, provider);
        this.protocolMap[protocol.id] = protocol;
      }
    }
    for (const Swapper of Adapter.Swappers) {
      if (Swapper.isSupported(this.chainId)) {
        this.swappers.push(new Swapper(chainId, provider));
      }
    }
  }

  get protocolIds() {
    return Object.keys(this.protocolMap);
  }

  findSwapper(tokenOrTokens: common.Token | common.Token[]) {
    const canCustomTokenSwappers: Swapper[] = [];
    const tokensSupportedSwappers: Swapper[] = [];
    let bestSwapper: Swapper | undefined;
    for (const swapper of this.swappers) {
      if (swapper.canCustomToken) {
        canCustomTokenSwappers.push(swapper);
      }

      const isNotSupported = Array.isArray(tokenOrTokens)
        ? tokenOrTokens.some((token) => !swapper.isSupportedToken(token))
        : !swapper.isSupportedToken(tokenOrTokens);
      if (isNotSupported) {
        continue;
      }
      tokensSupportedSwappers.push(swapper);

      bestSwapper = swapper;
      break;
    }
    if (!bestSwapper) {
      bestSwapper = tokensSupportedSwappers[0] ?? canCustomTokenSwappers[0];
    }
    if (!bestSwapper) {
      bestSwapper = this.swappers[0];
    }

    return bestSwapper;
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

  // 1. flashloan srcToken
  // 2. swap srcToken to destToken
  // 3. deposit destToken, get aDestToken
  // 4. return-funds aDestToken to user
  // 5. add-funds aSrcToken to router
  // 6. withdraw srcToken
  // 7. flashloan repay srcToken
  // * srcToken = old deposit token
  // * destToken = new deposit token
  async getCollateralSwap(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const wrappedSrcToken = srcToken.wrapped;
    const wrappedDestToken = destToken.wrapped;

    const collateralSwapLogics: apisdk.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      repays: [{ token: wrappedSrcToken, amount: srcAmount }],
    });

    const flashLoanTokenAmount = flashLoanAggregatorQuotation.loans.tokenAmountMap[wrappedSrcToken.address];

    const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    collateralSwapLogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapper = this.findSwapper([wrappedSrcToken, wrappedDestToken]);
    const swapQuotation = await swapper.quote({
      input: flashLoanTokenAmount,
      tokenOut: wrappedDestToken,
      slippage: defaultSlippage,
    });

    const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
    collateralSwapLogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyLogic = await protocol.newSupplyLogic({ input: swapQuotation.output, marketId, account });

    collateralSwapLogics.push(supplyLogic);

    afterPortfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // if not compound v3, compound v3 does not need return and add funds in collateral swap flow
    if (protocolId !== 'compound-v3') {
      if (!supplyLogic.fields.output) throw new Error('incorrect supply result');
      // ---------- return funds ----------
      const returnLogic = apisdk.protocols.utility.newSendTokenLogic({
        input: supplyLogic.fields.output,
        recipient: account,
      });
      collateralSwapLogics.push(returnLogic);

      // ---------- add funds ----------
      const addLogic = apisdk.protocols.permit2.newPullTokenLogic({
        input: new common.TokenAmount(protocol.toProtocolToken(marketId, wrappedSrcToken), srcAmount),
      });
      collateralSwapLogics.push(addLogic);
    }

    // ---------- withdraw ----------
    const withdrawLogic = await protocol.newWithdrawLogic({
      output: new common.TokenAmount(wrappedSrcToken, srcAmount),
      marketId,
      account,
    });
    collateralSwapLogics.push(withdrawLogic);

    afterPortfolio.withdraw(wrappedSrcToken, srcAmount);

    // ---------- flashloan repay ----------
    collateralSwapLogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await apisdk.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: collateralSwapLogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<apisdk.RouterData, 'chainId' | 'account' | 'logics'>,
      apiKey?: string
    ): Promise<common.TransactionRequest> =>
      apisdk.buildRouterTransactionRequest(
        { ...args, chainId: this.chainId, account, logics: collateralSwapLogics },
        apiKey ? { 'x-api-key': apiKey } : undefined
      );

    return {
      fields: {
        srcToken: srcToken,
        srcAmount: srcAmount,
        destToken: destToken,
<<<<<<< Updated upstream
        // TODO: check which one is right
        destAmount: swapQuotation.output.amount, //withdrawLogic.fields.output.amount,
=======
        destAmount: swapQuotation.output.amount,
>>>>>>> Stashed changes
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: collateralSwapLogics,
    };
  }

  // 1. flashloan destToken
  // 2. swap destToken to srcToken
  // 3. repay srcToken
  // 4. borrow destToken
  // 5. flashloan repay destToken
  // * srcToken = old borrow token
  // * destToken = new borrow token
  async getDebtSwap(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const wrappedSrcToken = srcToken.wrapped;
    const wrappedDestToken = destToken.wrapped;

    const debtSwapLogics: apisdk.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // ---------- Pre-calc quotation ----------
    const swapper = this.findSwapper([wrappedSrcToken, wrappedDestToken]);
    // get the quotation for how much dest token is needed to exchange for the src amount
    let swapQuotation = await swapper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
      slippage: defaultSlippage,
    });
    // convert swap type to exact in
    swapQuotation = await swapper.quote({
      input: swapQuotation.input,
      tokenOut: srcToken,
      slippage: defaultSlippage,
    });

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [swapQuotation.input],
    });
    const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    debtSwapLogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
    debtSwapLogics.push(swapTokenLogic);

    // ---------- repay ----------
    const repayLogic = await protocol.newRepayLogic({
      input: swapQuotation.output,
      borrower: account,
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    debtSwapLogics.push(repayLogic);
    afterPortfolio.repay(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- borrow ----------
    const borrowTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[wrappedDestToken.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
      interestRateMode: defaultInterestRateMode,
    });

    debtSwapLogics.push(borrowLogic);
    afterPortfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    debtSwapLogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await apisdk.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: debtSwapLogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<apisdk.RouterData, 'chainId' | 'account' | 'logics'>,
      apiKey?: string
    ): Promise<common.TransactionRequest> =>
      apisdk.buildRouterTransactionRequest(
        { ...args, chainId: this.chainId, account, logics: debtSwapLogics },
        apiKey ? { 'x-api-key': apiKey } : undefined
      );

    return {
      fields: {
        srcToken: srcToken,
        srcAmount: srcAmount,
        destToken: destToken,
        destAmount: borrowTokenAmount.amount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: debtSwapLogics,
    };
  }

  // 1. flashloan destToken
  // 2. swap destToken to srcToken
  // 3. deposit srcToken, get aSrcToken
  // 4. return funds aSrcToken to user
  // 5. borrow destToken
  // 6. flashloan repay destToken
  // * srcToken => depositToken, collateralToken
  // * destToken => flashloanToken, borrowToken
  /**
   * params' srcToken is which user want to long(collateral token), destToken is flashloan token(borrow token)
   * @param protocolId
   * @param marketId
   * @param params
   * @param account
   * @param portfolio
   * @returns
   */
  async getLeverageLong(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const wrappedSrcToken = srcToken.wrapped;
    const wrappedDestToken = destToken.wrapped;

    const leverageLonglogics: apisdk.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // ---------- Pre-calc quotation ----------
    const swapper = this.findSwapper([wrappedDestToken, wrappedSrcToken]);
    // retrieve the amount needed to borrow based on the collateral token and amount
    let swapQuotation = await swapper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
      slippage: defaultSlippage,
    });
    // convert swap type to exact in
    swapQuotation = await swapper.quote({
      input: swapQuotation.input,
      tokenOut: wrappedSrcToken,
      slippage: defaultSlippage,
    });

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [swapQuotation.input],
    });

    const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );

    leverageLonglogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
    leverageLonglogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyLogic = await protocol.newSupplyLogic({ input: swapQuotation.output, marketId, account });
    leverageLonglogics.push(supplyLogic);
    afterPortfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- return funds ----------
    if (supplyLogic.fields.output) {
      const returnLogic = apisdk.protocols.utility.newSendTokenLogic({
        input: supplyLogic.fields.output,
        recipient: account,
      });
      leverageLonglogics.push(returnLogic);
    }

    // ---------- borrow ----------
    const borrowTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[swapQuotation.input.token.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    leverageLonglogics.push(borrowLogic);

    afterPortfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    leverageLonglogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await apisdk.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: leverageLonglogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<apisdk.RouterData, 'chainId' | 'account' | 'logics'>,
      apiKey?: string
    ): Promise<common.TransactionRequest> =>
      apisdk.buildRouterTransactionRequest(
        { ...args, chainId: this.chainId, account, logics: leverageLonglogics },
        apiKey ? { 'x-api-key': apiKey } : undefined
      );

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: borrowTokenAmount.amount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: leverageLonglogics,
    };
  }

  // 1. flashloan srcToken
  // 2. swap srcToken to destToken
  // 3. deposit destToken, get aDestToken
  // 4. return funds aDestToken to user
  // 5. borrow srcToken
  // 6. flashloan repay srcToken
  // * srcToken => flashloanToken, borrowToken
  // * destToken => depositToken, collateralToken
  // * srcAmount => flashloan amount
  async getLeverageShort(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const wrappedSrcToken = srcToken.wrapped;
    const wrappedDestToken = destToken.wrapped;

    const leverageShortlogics: apisdk.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [{ token: wrappedSrcToken, amount: srcAmount }],
    });

    const flashLoanTokenAmount = flashLoanAggregatorQuotation.loans.tokenAmountMap[wrappedSrcToken.address];

    const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    leverageShortlogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapper = this.findSwapper([wrappedSrcToken, wrappedDestToken]);
    const swapQuotation = await swapper.quote({
      input: flashLoanTokenAmount,
      tokenOut: wrappedDestToken,
      slippage: defaultSlippage,
    });
    const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
    leverageShortlogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyLogic = await protocol.newSupplyLogic({ input: swapQuotation.output, marketId, account });
    leverageShortlogics.push(supplyLogic);

    afterPortfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- return funds ----------
    if (supplyLogic.fields.output) {
      const returnLogic = apisdk.protocols.utility.newSendTokenLogic({
        input: supplyLogic.fields.output,
        recipient: account,
      });
      leverageShortlogics.push(returnLogic);
    }

    // ---------- borrow ----------
    const borrowTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[wrappedSrcToken.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    leverageShortlogics.push(borrowLogic);

    afterPortfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    leverageShortlogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await apisdk.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: leverageShortlogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<apisdk.RouterData, 'chainId' | 'account' | 'logics'>,
      apiKey?: string
    ): Promise<common.TransactionRequest> =>
      apisdk.buildRouterTransactionRequest(
        { ...args, chainId: this.chainId, account, logics: leverageShortlogics },
        apiKey ? { 'x-api-key': apiKey } : undefined
      );

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: supplyLogic.fields.input.amount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: leverageShortlogics,
    };
  }

  // 1. flashloan destToken
  // 2. swap destToken to srcToken
  // 3. repay srcToken
  // 4. add fund destToken
  // 5. withdraw destToken by aDestToken
  // 6. flashloan repay destToken
  // * srcToken => borrowToken, repayToken
  // * destToken => depositToken, collateralToken
  async getDeleverage(
    protocolId: string,
    marketId: string,
    params: BaseParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<BaseFields> {
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);
    const wrappedSrcToken = srcToken.wrapped;
    const wrappedDestToken = destToken.wrapped;

    const deleveragelogics: apisdk.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // ---------- Pre-calc quotation ----------
    const swapper = this.findSwapper([wrappedDestToken, wrappedSrcToken]);
    //  get the quotation for how much collateral token is needed to exchange for the repay amount
    const swapQuotation = await swapper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
      slippage: defaultSlippage,
    });

    // TODO: seems we do not need this
    // // convert swap type to exact in
    // swapQuotation = await swapper.quote({
    //   input: swapQuotation.input,
    //   tokenOut: wrappedDestToken,
    //   slippage: defaultSlippage,
    // });

    // ---------- flashloan ----------
    const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(this.chainId, {
      loans: [swapQuotation.input],
    });

    const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
      flashLoanAggregatorQuotation.protocolId,
      flashLoanAggregatorQuotation.loans.toArray()
    );
    deleveragelogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
    deleveragelogics.push(swapTokenLogic);

    // ---------- repay ----------
    const repayLogic = await protocol.newRepayLogic({
      input: swapQuotation.output,
      borrower: account,
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    deleveragelogics.push(repayLogic);
    afterPortfolio.repay(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- add funds ----------
    if (protocolId !== 'compound-v3') {
      const addLogic = apisdk.protocols.permit2.newPullTokenLogic({
        input: swapQuotation.input,
      });
      deleveragelogics.push(addLogic);
    }

    // ---------- withdraw ----------
    const withdrawTokenAmount = flashLoanAggregatorQuotation.repays.tokenAmountMap[wrappedDestToken.address];
    const withdrawLogic = await protocol.newWithdrawLogic({
      output: new common.TokenAmount(wrappedDestToken, withdrawTokenAmount.amount),
      marketId,
      account,
    });
    deleveragelogics.push(withdrawLogic);

    // ---------- flashloan repay ----------
    deleveragelogics.push(flashLoanRepayLogic);

    // ---------- tx related ----------
    const estimateResult = await apisdk.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: deleveragelogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<apisdk.RouterData, 'chainId' | 'account' | 'logics'>,
      apiKey?: string
    ): Promise<common.TransactionRequest> =>
      apisdk.buildRouterTransactionRequest(
        { ...args, chainId: this.chainId, account, logics: deleveragelogics },
        apiKey ? { 'x-api-key': apiKey } : undefined
      );

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: withdrawLogic.fields.output.amount,
        portfolio,
        afterPortfolio,
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
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);

    const zapSupplylogics: apisdk.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));

    const afterPortfolio = portfolio.clone();

    let supplyTokenAmount = new common.TokenAmount(srcToken, srcAmount);

    // ---------- swap ----------
    if (!srcToken.wrapped.is(destToken.wrapped)) {
      const swapper = this.findSwapper([srcToken, destToken]);
      const swapQuotation = await swapper.quote({
        input: { token: srcToken, amount: srcAmount },
        tokenOut: destToken,
        slippage: defaultSlippage,
      });
      const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
      supplyTokenAmount = swapQuotation.output;
      zapSupplylogics.push(swapTokenLogic);
    }

    // ---------- supply ----------
    const supplyLogic = await protocol.newSupplyLogic({
      input: supplyTokenAmount,
      marketId,
      account,
    });
    zapSupplylogics.push(supplyLogic);

    afterPortfolio.supply(supplyTokenAmount.token, supplyTokenAmount.amount);

    // ---------- tx related ----------
    const estimateResult = await apisdk.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapSupplylogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<apisdk.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      apisdk.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapSupplylogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: supplyTokenAmount.amount,
        portfolio,
        afterPortfolio,
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
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);

    const zapWithdrawlogics: apisdk.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // init with withdraw token amount
    let outputTokenAmount = new common.TokenAmount(srcToken, srcAmount);

    // ---------- withdraw ----------
    const withdrawLogic = await protocol.newWithdrawLogic({
      output: outputTokenAmount,
      marketId,
      account,
    });
    zapWithdrawlogics.push(withdrawLogic);

    afterPortfolio.withdraw(srcToken, withdrawLogic.fields.output.amount);

    // ---------- swap ----------
    if (!srcToken.unwrapped.is(destToken.unwrapped)) {
      const swapper = this.findSwapper([srcToken, destToken]);
      const swapQuotation = await swapper.quote({
        input: withdrawLogic.fields.output,
        tokenOut: destToken,
        slippage: defaultSlippage,
      });
      outputTokenAmount = swapQuotation.output;
      const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
      zapWithdrawlogics.push(swapTokenLogic);
    }

    // ---------- tx related ----------
    const estimateResult = await apisdk.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapWithdrawlogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<apisdk.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      apisdk.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapWithdrawlogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: outputTokenAmount.amount,
        portfolio,
        afterPortfolio,
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
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);

    const zapBorrowlogics: apisdk.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // init with borrow token amount
    let outputTokenAmount = new common.TokenAmount(srcToken, srcAmount);

    // ---------- borrow ----------
    const borrowLogic = protocol.newBorrowLogic({
      output: { token: srcToken, amount: srcAmount },
      interestRateMode: defaultInterestRateMode,
      marketId,
    });
    zapBorrowlogics.push(borrowLogic);

    afterPortfolio.borrow(srcToken, srcAmount);

    // ---------- swap ----------
    if (!srcToken.unwrapped.is(destToken.unwrapped)) {
      const swapper = this.findSwapper([srcToken, destToken]);
      const swapQuotation = await swapper.quote({
        input: { token: srcToken, amount: srcAmount },
        tokenOut: destToken,
        slippage: defaultSlippage,
      });
      outputTokenAmount = swapQuotation.output;
      const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
      zapBorrowlogics.push(swapTokenLogic);
    }
    // ---------- tx related ----------
    const estimateResult = await apisdk.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapBorrowlogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<apisdk.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      apisdk.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapBorrowlogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,

        destAmount: outputTokenAmount.amount,
        portfolio,
        afterPortfolio,
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
    const { srcAmount } = params;
    const srcToken = common.classifying(params.srcToken);
    const destToken = common.classifying(params.destToken);

    const zapRepaylogics: apisdk.Logic<any>[] = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account, marketId));
    const afterPortfolio = portfolio.clone();

    // init with token in
    let repayTokenAmount = new common.TokenAmount(srcToken, srcAmount);

    // ---------- swap ----------
    if (!srcToken.unwrapped.is(destToken.unwrapped)) {
      const swapper = this.findSwapper([srcToken, destToken]);
      const swapQuotation = await swapper.quote({
        input: { token: srcToken, amount: srcAmount },
        tokenOut: destToken,
        slippage: defaultSlippage,
      });
      repayTokenAmount = swapQuotation.output;
      const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
      zapRepaylogics.push(swapTokenLogic);
    }
    // ---------- repay ----------
    const repayLogic = await protocol.newRepayLogic({
      borrower: account,
      interestRateMode: defaultInterestRateMode,
      input: new common.TokenAmount(repayTokenAmount.token, repayTokenAmount.amount),
      marketId,
    });

    zapRepaylogics.push(repayLogic);

    afterPortfolio.repay(repayTokenAmount.token, repayTokenAmount.amount);

    // ---------- tx related ----------
    const estimateResult = await apisdk.estimateRouterData(
      {
        chainId: this.chainId,
        account,
        logics: zapRepaylogics,
      },
      this.permitType
    );

    const buildRouterTransactionRequest = (
      args?: Omit<apisdk.RouterData, 'chainId' | 'account' | 'logics'>
    ): Promise<common.TransactionRequest> =>
      apisdk.buildRouterTransactionRequest({ ...args, chainId: this.chainId, account, logics: zapRepaylogics });

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: repayTokenAmount.amount,
        portfolio,
        afterPortfolio,
      },
      estimateResult,
      buildRouterTransactionRequest,
      logics: zapRepaylogics,
    };
  }
}
