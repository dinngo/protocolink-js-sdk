import {
  CollateralSwapFields,
  CollateralSwapParams,
  DebtSwapFields,
  DebtSwapParams,
  DeleverageFields,
  DeleverageParams,
  LeverageLongFields,
  LeverageLongParams,
  LeverageShortFields,
  LeverageShortParams,
  ZapWithdrawFields,
  ZapWithdrawParams,
} from './adapter.type';
import { FlashLoaner, FlashLoanerClass } from './flashloaner';
import { Portfolio } from './protocol.portfolio';
import { Protocol, ProtocolClass } from './protocol';
import { Swaper, SwaperClass } from './swaper';
import * as common from '@protocolink/common';
import { configMap } from './adapter.config';
import flatten from 'lodash/flatten';
import { isSameToken, wrapToken } from './helper';
import * as logics from '@protocolink/logics';
import { protocols } from '@protocolink/api';
import { providers } from 'ethers';
import { toAToken } from './protocols/aave-v3/configs';

export class Adapter extends common.Web3Toolkit {
  static Protocols: ProtocolClass[] = [];

  static registerProtocol(protocol: ProtocolClass) {
    this.Protocols.push(protocol);
  }

  static Swapers: SwaperClass[] = [];

  static registerSwaper(swaper: SwaperClass) {
    this.Swapers.push(swaper);
  }

  static FlashLoaners: FlashLoanerClass[] = [];

  static registerFlashLoaner(flashLoaner: FlashLoanerClass) {
    this.FlashLoaners.push(flashLoaner);
  }

  protocolMap: Record<string, Protocol> = {};
  swapers: Swaper[] = [];
  flashLoaners: FlashLoaner[] = [];

  constructor(chainId: number, provider: providers.Provider) {
    super(chainId, provider);

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
    for (const FlashLoaner of Adapter.FlashLoaners) {
      if (FlashLoaner.isSupported(this.chainId)) {
        this.flashLoaners.push(new FlashLoaner(chainId, provider));
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

  canFlashLoan(token: common.Token) {
    return this.flashLoaners.some((flashLoaner) => flashLoaner.isSupportedToken(token));
  }

  findFlashLoaner(token: common.Token, preferredFlashLoanerId?: string) {
    let bestFlashLoaner: FlashLoaner | undefined;
    for (const flashLoaner of this.flashLoaners) {
      if (flashLoaner.isSupportedToken(token)) {
        if (preferredFlashLoanerId && flashLoaner.id === preferredFlashLoanerId) {
          bestFlashLoaner = flashLoaner;
          break;
        }
        if (!bestFlashLoaner || flashLoaner.feeBps < bestFlashLoaner.feeBps) {
          bestFlashLoaner = flashLoaner;
        }
      }
    }

    return bestFlashLoaner!;
  }

  async getPortfolios(account: string): Promise<Portfolio[]> {
    const portfolios = await Promise.all(
      Object.values(this.protocolMap).map((protocol) => protocol.getPortfolios(account))
    );
    return flatten(portfolios);
  }

  // TODO:
  async getPortfolio(account: string, _marketId: string) {
    return (await this.getPortfolios(account))[0];
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
  async getCollateralSwapQuotationAndLogics(
    protocolId: string,
    params: CollateralSwapParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<CollateralSwapFields> {
    const { srcToken, srcAmount, destToken } = params;
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);
    const collateralSwapLogics = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const liquidationThreshold = portfolio.liquidationThreshold;

    // ---------- flashloan ----------
    const flashloaner = this.findFlashLoaner(wrappedSrcToken);
    const flashloanQuotation = await flashloaner.quote({ repays: [{ token: wrappedSrcToken, amount: srcAmount }] });
    const flashLoanTokenAmount = flashloanQuotation.loans.tokenAmountMap[wrappedSrcToken.address];

    const [flashLoanLoanLogic, flashLoanRepayLogic] = flashloaner.newFlashLoanLogicPair([flashLoanTokenAmount]);
    collateralSwapLogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swaper = this.findSwaper([wrappedSrcToken, wrappedDestToken]);
    const swapQuotation = await swaper.quote({ input: flashLoanTokenAmount, tokenOut: wrappedDestToken });

    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    collateralSwapLogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyQuotation = await protocol.getSupplyQuotation({
      input: swapQuotation.output,
      tokenOut: toAToken(this.chainId, swapQuotation.output.token),
    });

    const supplyLogic = protocol.newSupplyLogic(supplyQuotation);
    collateralSwapLogics.push(supplyLogic);

    portfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- return funds ----------
    const returnLogic = protocols.utility.newSendTokenLogic({
      input: supplyQuotation.output,
      recipient: account,
    });
    collateralSwapLogics.push(returnLogic);

    // TODO:
    // ---------- add funds ----------
    // collateralSwapLogics.push(addLogic);

    // ---------- withdraw ----------
    const withdrawQuotation = await protocol.getWithdrawQuotation({
      input: { token: toAToken(this.chainId, wrappedSrcToken), amount: srcAmount },
      tokenOut: wrappedSrcToken,
    });

    const withdrawLogic = protocol.newWithdrawLogic(withdrawQuotation);
    collateralSwapLogics.push(withdrawLogic);

    portfolio.withdraw(wrappedSrcToken, srcAmount);

    // ---------- flashloan repay ----------
    collateralSwapLogics.push(flashLoanRepayLogic);

    return {
      fields: {
        srcToken: srcToken,
        srcAmount: srcAmount,
        destToken: destToken,
        destAmount: supplyQuotation.output.amount,
        before: { healthRate, netAPY, liquidationThreshold },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          liquidationThreshold: portfolio.liquidationThreshold,
        },
      },
      logics: collateralSwapLogics,
    };
  }

  // tokenA: USDC, tokenB: USDT
  // 1. flashloan USDT
  // 2. swap USDT to USDC
  // 3. repay USDC
  // 4. borrow USDT
  // 5. flashloan repay USDT
  async getDebtSwapQuotationAndLogics(
    protocolId: string,
    params: DebtSwapParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<DebtSwapFields> {
    const { srcToken, srcAmount, destToken } = params;
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);

    const debtSwapLogics = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const liquidationThreshold = portfolio.liquidationThreshold;

    // ---------- Pre-calc quotation ----------
    const swaper = this.findSwaper([wrappedSrcToken, wrappedDestToken]);
    // get the quotation for how much dest token is needed to exchange for the src amount
    let swapQuotation = await swaper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
    });
    // convert swap type to exact in
    swapQuotation = await swaper.quote({ input: swapQuotation.input, tokenOut: srcToken });

    // ---------- flashloan ----------
    const flashloaner = this.findFlashLoaner(wrappedSrcToken);
    const flashloanQuotation = await flashloaner.quote({ loans: [swapQuotation.input] });
    const flashLoanTokenAmount = flashloanQuotation.loans.tokenAmountMap[wrappedSrcToken.address];

    const [flashLoanLoanLogic, flashLoanRepayLogic] = flashloaner.newFlashLoanLogicPair([flashLoanTokenAmount]);
    debtSwapLogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    debtSwapLogics.push(swapTokenLogic);

    // ---------- repay ----------
    const repayQuotation = await protocol.getRepayQuotation({
      tokenIn: swapQuotation.output.token,
      borrower: account,
      interestRateMode: logics.aavev3.InterestRateMode.variable,
    });
    const repayLogic = protocol.newRepayLogic(repayQuotation);
    debtSwapLogics.push(repayLogic);
    portfolio.repay(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- borrow ----------
    const borrowTokenAmount = flashloanQuotation.repays.tokenAmountMap[wrappedDestToken.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
    });
    debtSwapLogics.push(borrowLogic);
    portfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    debtSwapLogics.push(flashLoanRepayLogic);

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
  async getLeverageLongQuotationAndLogics(
    protocolId: string,
    params: LeverageLongParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<LeverageLongFields> {
    const { srcToken, srcAmount, destToken } = params;
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);

    const leverageLonglogics = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const liquidationThreshold = portfolio.liquidationThreshold;

    // ---------- Pre-calc quotation ----------
    const swaper = this.findSwaper([wrappedDestToken, wrappedSrcToken]);
    // retrieve the amount needed to borrow based on the collateral token and amount
    let swapQuotation = await swaper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
    });
    // convert swap type to exact in
    swapQuotation = await swaper.quote({
      input: swapQuotation.input,
      tokenOut: wrappedSrcToken,
    });

    // ---------- flashloan ----------
    const flashloaner = this.findFlashLoaner(swapQuotation.input.token);
    const flashloanQuotation = await flashloaner.quote({ loans: [swapQuotation.input] });
    const flashLoanTokenAmount = flashloanQuotation.loans.tokenAmountMap[swapQuotation.input.token.address];

    const [flashLoanLoanLogic, flashLoanRepayLogic] = flashloaner.newFlashLoanLogicPair([flashLoanTokenAmount]);
    leverageLonglogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    leverageLonglogics.push(swapTokenLogic);

    // ---------- supply ----------
    const aToken = toAToken(this.chainId, swapQuotation.output.token);
    const supplyQuotation = await protocol.getSupplyQuotation({
      input: swapQuotation.output,
      tokenOut: aToken,
    });

    const supplyLogic = protocol.newSupplyLogic(supplyQuotation);
    leverageLonglogics.push(supplyLogic);
    portfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- return funds ----------
    const returnLogic = protocols.utility.newSendTokenLogic({
      input: supplyQuotation.output,
      recipient: account,
    });
    leverageLonglogics.push(returnLogic);

    // ---------- borrow ----------
    const borrowTokenAmount = flashloanQuotation.repays.tokenAmountMap[swapQuotation.input.token.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
    });
    leverageLonglogics.push(borrowLogic);

    portfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    leverageLonglogics.push(flashLoanRepayLogic);

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
  async getLeverageShortQuotationAndLogics(
    protocolId: string,
    params: LeverageShortParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<LeverageShortFields> {
    const { srcToken, srcAmount, destToken } = params;
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);
    const leverageShortlogics = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const liquidationThreshold = portfolio.liquidationThreshold;

    // ---------- flashloan ----------
    const flashloaner = this.findFlashLoaner(wrappedSrcToken);
    const flashloanQuotation = await flashloaner.quote({ loans: [{ token: wrappedSrcToken, amount: srcAmount }] });
    const flashLoanTokenAmount = flashloanQuotation.loans.tokenAmountMap[wrappedSrcToken.address];
    const [flashLoanLoanLogic, flashLoanRepayLogic] = flashloaner.newFlashLoanLogicPair([flashLoanTokenAmount]);
    leverageShortlogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swaper = this.findSwaper([wrappedSrcToken, wrappedDestToken]);
    const swapQuotation = await swaper.quote({
      input: flashLoanTokenAmount,
      tokenOut: wrappedDestToken,
    });
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    leverageShortlogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyQuotation = await protocol.getSupplyQuotation({
      input: swapQuotation.output,
      tokenOut: toAToken(this.chainId, swapQuotation.output.token),
    });
    const supplyLogic = protocol.newSupplyLogic(supplyQuotation);
    leverageShortlogics.push(supplyLogic);

    portfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    // ---------- return funds ----------
    const returnLogic = protocols.utility.newSendTokenLogic({
      input: supplyQuotation.output,
      recipient: account,
    });
    leverageShortlogics.push(returnLogic);

    // ---------- borrow ----------
    const borrowTokenAmount = flashloanQuotation.repays.tokenAmountMap[wrappedSrcToken.address];
    const borrowLogic = protocol.newBorrowLogic({
      output: borrowTokenAmount,
    });
    leverageShortlogics.push(borrowLogic);

    portfolio.borrow(borrowTokenAmount.token, borrowTokenAmount.amount);

    // ---------- flashloan repay ----------
    leverageShortlogics.push(flashLoanRepayLogic);

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
  async getDeleverageQuotationAndLogics(
    protocolId: string,
    params: DeleverageParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<DeleverageFields> {
    const { srcToken, srcAmount, destToken } = params;
    const wrappedSrcToken = wrapToken(this.chainId, srcToken);
    const wrappedDestToken = wrapToken(this.chainId, destToken);
    const deleveragelogics = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const liquidationThreshold = portfolio.liquidationThreshold;

    // ---------- Pre-calc quotation ----------
    const swaper = this.findSwaper([wrappedDestToken, wrappedSrcToken]);
    //  get the quotation for how much collateral token is needed to exchange for the repay amount
    let swapQuotation = await swaper.quote({
      tokenIn: wrappedDestToken,
      output: { token: wrappedSrcToken, amount: srcAmount },
    });
    // convert swap type to exact in
    swapQuotation = await swaper.quote({ input: swapQuotation.input, tokenOut: wrappedSrcToken });

    // ---------- flashloan ----------
    const flashloaner = this.findFlashLoaner(wrappedDestToken);
    const flashloanQuotation = await flashloaner.quote({ loans: [swapQuotation.input] });
    const flashLoanTokenAmount = flashloanQuotation.loans.tokenAmountMap[wrappedDestToken.address];
    const [flashLoanLoanLogic, flashLoanRepayLogic] = flashloaner.newFlashLoanLogicPair([flashLoanTokenAmount]);
    deleveragelogics.push(flashLoanLoanLogic);

    // ---------- swap ----------
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    deleveragelogics.push(swapTokenLogic);

    // ---------- repay ----------
    const repayQuotation = await protocol.getRepayQuotation({
      tokenIn: swapQuotation.output.token,
      borrower: account,
      interestRateMode: logics.aavev3.InterestRateMode.variable,
    });
    const repayLogic = protocol.newRepayLogic(repayQuotation);
    deleveragelogics.push(repayLogic);
    portfolio.repay(swapQuotation.output.token, swapQuotation.output.amount);

    // TODO:
    // ---------- add funds ----------
    // deleveragelogics.push(addLogic);

    // ---------- withdraw ----------
    const withdrawTokenAmount = flashloanQuotation.repays.tokenAmountMap[wrappedDestToken.address];
    const withdrawQuotation = await protocol.getWithdrawQuotation({
      input: { token: toAToken(this.chainId, wrappedDestToken), amount: withdrawTokenAmount.amount },
      tokenOut: wrappedDestToken,
    });

    const withdrawLogic = protocol.newWithdrawLogic(withdrawQuotation);
    deleveragelogics.push(withdrawLogic);

    // ---------- flashloan repay ----------
    deleveragelogics.push(flashLoanRepayLogic);

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: withdrawQuotation.input.amount,
        before: { healthRate, netAPY, liquidationThreshold },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          liquidationThreshold: portfolio.liquidationThreshold,
        },
      },
      logics: deleveragelogics,
    };
  }

  async getZapSupplyQuotationAndLogics(
    protocolId: string,
    params: CollateralSwapParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<DeleverageFields> {
    const { srcToken, srcAmount, destToken } = params;
    const zapSupplylogics = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const utilization = portfolio.utilization;

    // ---------- swap ----------
    const swaper = this.findSwaper([srcToken, destToken]);
    const swapQuotation = await swaper.quote({
      input: { token: srcToken, amount: srcAmount },
      tokenOut: destToken,
      slippage: 100,
    });
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    zapSupplylogics.push(swapTokenLogic);

    // ---------- supply ----------
    const supplyQuotation = await protocol.getSupplyQuotation({
      input: swapQuotation.output,
      tokenOut: toAToken(this.chainId, swapQuotation.output.token),
    });

    const supplyLogic = protocol.newSupplyLogic(supplyQuotation);
    zapSupplylogics.push(supplyLogic);

    portfolio.supply(swapQuotation.output.token, swapQuotation.output.amount);

    return {
      fields: {
        srcToken,
        srcAmount,
        destToken,
        destAmount: supplyQuotation.output.amount,
        before: { healthRate, netAPY, utilization },
        after: {
          healthRate: portfolio.healthRate,
          netAPY: portfolio.netAPY,
          utilization: portfolio.utilization,
        },
      },
      logics: zapSupplylogics,
    };
  }

  async getZapWithdrawQuotationAndLogics(
    protocolId: string,
    params: ZapWithdrawParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<ZapWithdrawFields> {
    const { srcToken, srcAmount, destToken } = params;
    const zapWithdrawlogics = [];
    const protocol = this.getProtocol(protocolId);

    if (!portfolio) {
      portfolio = await protocol.getPortfolio(account);
    }

    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const utilization = portfolio.utilization;

    // ---------- withdraw ----------
    const withdrawQuotation = await protocol.getWithdrawQuotation({
      input: { token: toAToken(this.chainId, srcToken), amount: srcAmount },
      tokenOut: srcToken,
    });

    const withdrawLogic = protocol.newWithdrawLogic(withdrawQuotation);
    zapWithdrawlogics.push(withdrawLogic);

    portfolio.withdraw(srcToken, srcAmount);

    // ---------- swap ----------
    const swaper = this.findSwaper([withdrawQuotation.output.token, destToken]);
    const swapQuotation = await swaper.quote({
      input: withdrawQuotation.output,
      tokenOut: destToken,
    });
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    zapWithdrawlogics.push(swapTokenLogic);

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
      logics: zapWithdrawlogics,
    };
  }

  async getZapBorrowQuotationAndLogics(
    protocolId: string,
    params: CollateralSwapParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<DeleverageFields> {
    const { srcToken, srcAmount, destToken } = params;
    const zapBorrowlogics = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const totalBorrowUSD = portfolio.totalBorrowUSD.toString();
    const utilization = portfolio.utilization;

    // ---------- borrow ----------
    const borrowLogic = protocol.newBorrowLogic({
      output: { token: srcToken, amount: srcAmount },
    });
    zapBorrowlogics.push(borrowLogic);
    portfolio.borrow(srcToken, srcAmount);

    // ---------- swap ----------
    const swaper = this.findSwaper([srcToken, destToken]);
    const swapQuotation = await swaper.quote({
      input: { token: srcToken, amount: srcAmount },
      tokenOut: destToken,
    });
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    zapBorrowlogics.push(swapTokenLogic);

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
      logics: zapBorrowlogics,
    };
  }

  async getZapRepayQuotationAndLogics(
    protocolId: string,
    params: CollateralSwapParams,
    account: string,
    portfolio?: Portfolio
  ): Promise<DeleverageFields> {
    const { srcToken, srcAmount, destToken } = params;
    const zapRepaylogics = [];
    const protocol = this.getProtocol(protocolId);

    portfolio = portfolio || (await protocol.getPortfolio(account));
    const healthRate = portfolio.healthRate;
    const netAPY = portfolio.netAPY;
    const totalBorrowUSD = portfolio.totalBorrowUSD.toString();
    const utilization = portfolio.utilization;

    // ---------- swap ----------
    const swaper = this.findSwaper([destToken, srcToken]);
    const swapQuotation = await swaper.quote({ tokenIn: destToken, output: { token: srcToken, amount: srcAmount } });
    const swapTokenLogic = swaper.newSwapTokenLogic(swapQuotation);
    zapRepaylogics.push(swapTokenLogic);

    // ---------- repay ----------
    const repayQuotation = await protocol.getRepayQuotation({
      tokenIn: swapQuotation.output.token,
      borrower: account,
      interestRateMode: logics.aavev3.InterestRateMode.variable,
    });
    const repayLogic = protocol.newRepayLogic(repayQuotation);
    zapRepaylogics.push(repayLogic);
    portfolio.repay(swapQuotation.output.token, swapQuotation.output.amount);

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
      logics: zapRepaylogics,
    };
  }
}
