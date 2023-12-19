import BigNumberJS from 'bignumber.js';
import { OperationInput, OperationOutput } from './adapter.type';
import { Protocol, ProtocolClass } from './protocol';
import { Swapper, SwapperClass } from './swapper';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import { configMap } from './adapter.config';
import { defaultSlippage } from './protocol.type';
import flatten from 'lodash/flatten';
import { providers } from 'ethers';
import { scaleRepayAmount } from './adapter.utils';

type Options = {
  permitType?: apisdk.Permit2Type;
  apiKey?: string;
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

  protocolMap: Record<string, Protocol> = {};
  swappers: Swapper[] = [];
  permitType: apisdk.Permit2Type = 'permit';
  apiKey?: string;

  constructor(chainId: number, provider: providers.Provider, { permitType, apiKey }: Options = {}) {
    super(chainId, provider);

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

    if (permitType) this.permitType = permitType;
    if (apiKey) this.apiKey = apiKey;
  }

  get protocolIds() {
    return Object.keys(this.protocolMap);
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
    return this.primaryNonstablecoin.wrapped;
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
      if (excludedToken?.is(token)) continue;
      if (priorityToken?.is(token)) {
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

  async getPortfolios(account: string) {
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

  // 1. validate src amount
  // 2. flashloan loan src token
  // 3. swap src token to dest token
  // 4. deposit dest token
  // 5. withdraw src token, if protocol is collateral tokenized, perform the following actions first:
  // 5-1. return dest protocol token to user
  // 5-2. add src protocol token to agent
  // 6. flashloan repay src token
  // @param srcToken Old deposit token
  // @param destToken New deposit token
  async collateralSwap({
    account,
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
  }: OperationInput) {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(srcAmount) > 0) {
      const { protocolId, marketId } = portfolio;
      const protocol = this.getProtocol(protocolId);
      const srcCollateral = portfolio.findSupply(srcToken);
      const destCollateral = portfolio.findSupply(destToken);

      if (srcCollateral && destCollateral) {
        // 1. validate src amount
        if (new BigNumberJS(srcAmount).gt(srcCollateral.balance)) {
          output.error = { name: 'srcAmount', code: 'INSUFFICIENT_AMOUNT' };
        }
        output.afterPortfolio.withdraw(srcCollateral.token, srcAmount);

        if (!output.error) {
          // 2. ---------- flashloan ----------
          // utilize the src collateral withdraw amount as the flashloan repay amount
          // to reverse how much needs to be borrowed in the flashloan
          const flashLoanRepay = new common.TokenAmount(srcToken.wrapped, srcAmount);
          // 2-1. if protocol is collateral tokenized, sub 2 wei from the flashloan repay amount
          if (protocol.isAssetTokenized(marketId, srcToken)) {
            flashLoanRepay.subWei(2);
          }
          const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(
            this.chainId,
            { repays: [flashLoanRepay] }
          );
          const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
            flashLoanAggregatorQuotation.protocolId,
            flashLoanAggregatorQuotation.loans.toArray()
          );
          output.logics.push(flashLoanLoanLogic);

          // 3. ---------- swap ----------
          // swap the flashloan borrow amount to dest collateral
          const swapper = this.findSwapper([srcToken.wrapped, destToken.wrapped]);
          const swapQuotation = await swapper.quote({
            input: flashLoanAggregatorQuotation.loans.get(srcToken.wrapped),
            tokenOut: destToken.wrapped,
            slippage,
          });
          const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
          output.logics.push(swapTokenLogic);

          // 4. ---------- supply ----------
          // supply to target collateral
          const supplyInput = swapQuotation.output;
          const supplyLogic = protocol.newSupplyLogic({ marketId, input: supplyInput });
          // 4-1. use BalanceLink to prevent swap slippage
          supplyLogic.fields.balanceBps = common.BPS_BASE;
          output.logics.push(supplyLogic);
          output.afterPortfolio.supply(supplyInput.token, supplyInput.amount);
          // 4-2. set dest amount
          output.destAmount = supplyInput.amount;

          // 5. ---------- withdraw ----------
          const withdrawOutput = new common.TokenAmount(srcToken.wrapped, srcAmount);
          const withdrawLogic = protocol.newWithdrawLogic({ marketId, output: withdrawOutput });
          // 5-1. if protocol is collateral tokenized
          if (protocol.isAssetTokenized(marketId, withdrawOutput.token)) {
            // 5-1-1. return dest protocol token to user
            const returnFundsLogic = apisdk.protocols.utility.newSendTokenLogic({
              input: supplyLogic.fields.output!,
              recipient: account,
            });
            returnFundsLogic.fields.balanceBps = common.BPS_BASE;
            output.logics.push(returnFundsLogic);

            // 5-1-2. add src protocol token to agent
            const addFundsLogic = apisdk.protocols.permit2.newPullTokenLogic({ input: withdrawLogic.fields.input! });
            output.logics.push(addFundsLogic);

            // 5-1-3. use BalanceLink to prevent token shortages during the transfer
            withdrawLogic.fields.balanceBps = common.BPS_BASE;
          }
          // 5-2. append withdraw logic
          output.logics.push(withdrawLogic);

          // 6. append flashloan repay logic
          output.logics.push(flashLoanRepayLogic);
        }
      }
    }

    return output;
  }

  // 1. flashloan dest token
  // 2. swap dest token to src token
  // 3. repay src token
  // 4. borrow dest token
  // 5. flashloan repay dest token
  // @param srcToken Old borrow token
  // @param destToken New borrow token
  async debtSwap({ account, portfolio, srcToken, srcAmount, destToken, slippage = defaultSlippage }: OperationInput) {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(srcAmount) > 0) {
      const { protocolId, marketId } = portfolio;
      const protocol = this.getProtocol(protocolId);
      const srcBorrow = portfolio.findBorrow(srcToken);
      const destBorrow = portfolio.findBorrow(destToken);

      if (srcBorrow && destBorrow) {
        // 1. validate src amount
        if (new BigNumberJS(srcAmount).gt(srcBorrow.balances[0])) {
          output.error = { name: 'srcAmount', code: 'INSUFFICIENT_AMOUNT' };
        }
        output.afterPortfolio.repay(srcBorrow.token, srcAmount);

        if (!output.error) {
          // 2. scale src amount if user wants to repay all
          if (new BigNumberJS(srcAmount).eq(srcBorrow.balances[0])) {
            srcAmount = scaleRepayAmount(srcToken, srcAmount, slippage);
          }

          // 3. ---------- Pre-calc quotation ----------
          // get the quotation for how much dest token is needed to exchange for the src amount
          const swapper = this.findSwapper([destToken.wrapped, srcToken.wrapped]);
          let swapQuotation = await swapper.quote({
            tokenIn: destToken.wrapped,
            output: { token: srcToken.wrapped, amount: srcAmount },
          });
          // 3-1. convert swap type to exact in
          swapQuotation = await swapper.quote({ input: swapQuotation.input, tokenOut: srcToken.wrapped, slippage });

          // 4. ---------- flashloan ----------
          // flash loan dest amount and insert before swap token logic
          const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(
            this.chainId,
            { loans: [swapQuotation.input] }
          );
          const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
            flashLoanAggregatorQuotation.protocolId,
            flashLoanAggregatorQuotation.loans.toArray()
          );
          output.logics.push(flashLoanLoanLogic);

          // 5. ---------- swap ----------
          const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
          output.logics.push(swapTokenLogic);

          // 6. ---------- repay ----------
          const repayLogic = protocol.newRepayLogic({ marketId, account, input: swapQuotation.output });
          // 6-1. use BalanceLink to prevent swap slippage
          repayLogic.fields.balanceBps = common.BPS_BASE;
          output.logics.push(repayLogic);

          // 7. ---------- borrow ----------
          const borrowOutput = flashLoanAggregatorQuotation.repays.get(destToken.wrapped);
          const borrowLogic = protocol.newBorrowLogic({ marketId, output: borrowOutput });
          output.logics.push(borrowLogic);
          output.afterPortfolio.borrow(borrowOutput.token, borrowOutput.amount);
          // 7-1. set dest amount
          output.destAmount = borrowOutput.amount;

          // 8. append flashloan repay logic
          output.logics.push(flashLoanRepayLogic);
        }
      }
    }

    return output;
  }

  // 1. flashloan destToken
  // 2. swap destToken to srcToken
  // 3. deposit srcToken, get aSrcToken
  // 4. return funds aSrcToken to user
  // 5. borrow destToken
  // 6. flashloan repay destToken
  // @param srcToken Deposit token, collateral token
  // @param destToken Flashloan token, borrowed token
  async leverageLong({
    account,
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
  }: OperationInput) {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(srcAmount) > 0) {
      const { protocolId, marketId } = portfolio;
      const protocol = this.getProtocol(protocolId);
      const srcCollateral = portfolio.findSupply(srcToken);
      const destBorrow = portfolio.findBorrow(destToken);

      if (srcCollateral && destBorrow) {
        // 1. ---------- Pre-calc quotation ----------
        let flashLoanLoan: common.TokenAmount;
        let supplyInput: common.TokenAmount;
        let swapper: Swapper | undefined;
        let swapQuotation: any;
        // 1-1. the src token is equal to dest token
        if (srcToken.wrapped.is(destToken.wrapped)) {
          // 1-1-1. the flash loan loan amount and repay amount are the src amount
          flashLoanLoan = new common.TokenAmount(destToken.wrapped, srcAmount);
          supplyInput = new common.TokenAmount(srcToken.wrapped, srcAmount);
        }
        // 1-2. the src token is not equal to dest token
        else {
          swapper = this.findSwapper([destToken.wrapped, srcToken.wrapped]);
          // 1-2-1. retrieve the amount needed to borrow based on the collateral token and amount
          swapQuotation = await swapper.quote({
            tokenIn: destToken.wrapped,
            output: { token: srcToken.wrapped, amount: srcAmount },
          });
          // 1-2-2. convert swap type to exact in
          swapQuotation = await swapper.quote({ input: swapQuotation.input, tokenOut: srcToken.wrapped, slippage });
          // 1-2-3. the flash loan loan amount is the swap quotation input
          flashLoanLoan = swapQuotation.input;
          // 1-2-4. the supply amount is the swap quotation output
          supplyInput = swapQuotation.output;
        }

        // 2. ---------- flashloan ----------
        const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(
          this.chainId,
          { loans: [flashLoanLoan] }
        );
        const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
          flashLoanAggregatorQuotation.protocolId,
          flashLoanAggregatorQuotation.loans.toArray()
        );
        output.logics.push(flashLoanLoanLogic);

        // 3. ---------- swap ----------
        if (!srcToken.wrapped.is(destToken.wrapped) && swapper && swapQuotation) {
          const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
          output.logics.push(swapTokenLogic);
        }

        // 4. ---------- supply ----------
        const supplyLogic = protocol.newSupplyLogic({ marketId, input: supplyInput });
        // 4-1. if the src token is not equal to dest token, use BalanceLink to prevent swap slippage
        if (!srcToken.wrapped.is(destToken.wrapped)) {
          supplyLogic.fields.balanceBps = common.BPS_BASE;
        }
        output.logics.push(supplyLogic);
        output.afterPortfolio.supply(supplyInput.token, supplyInput.amount);

        // 5. ---------- return funds ----------
        // 5-1. if protocol is collateral tokenized
        if (protocol.isAssetTokenized(marketId, supplyInput.token)) {
          // 5-1-1. return protocol token to user
          const returnFundsLogic = apisdk.protocols.utility.newSendTokenLogic({
            input: supplyLogic.fields.output!,
            recipient: account,
          });
          returnFundsLogic.fields.balanceBps = common.BPS_BASE;
          output.logics.push(returnFundsLogic);
        }

        // 6. ---------- borrow ----------
        const borrowOutput = flashLoanAggregatorQuotation.repays.get(destToken.wrapped);
        const borrowLogic = protocol.newBorrowLogic({ marketId, output: borrowOutput });
        output.logics.push(borrowLogic);
        output.afterPortfolio.borrow(borrowOutput.token, borrowOutput.amount);
        // 6-1. set dest amount
        output.destAmount = borrowOutput.amount;

        // 7. append flash loan repay cube
        output.logics.push(flashLoanRepayLogic);
      }
    }

    return output;
  }

  // 1. flashloan srcToken
  // 2. swap srcToken to destToken
  // 3. deposit destToken, get aDestToken
  // 4. return funds aDestToken to user
  // 5. borrow srcToken
  // 6. flashloan repay srcToken
  // @param srcToken Flashloan token, borrowed token
  // @param destToken Deposit token, collateral token
  async leverageShort({
    account,
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
  }: OperationInput) {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(srcAmount) > 0) {
      const { protocolId, marketId } = portfolio;
      const protocol = this.getProtocol(protocolId);
      const srcBorrow = portfolio.findBorrow(srcToken);
      const destCollateral = portfolio.findSupply(destToken);

      if (srcBorrow && destCollateral) {
        // 1. ---------- flashloan ----------
        const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(
          this.chainId,
          { loans: [{ token: srcToken.wrapped, amount: srcAmount }] }
        );
        const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
          flashLoanAggregatorQuotation.protocolId,
          flashLoanAggregatorQuotation.loans.toArray()
        );
        output.logics.push(flashLoanLoanLogic);

        // 2. ---------- swap ----------
        let supplyInput: common.TokenAmount;
        // 2-1. the src token is equal to dest token
        if (srcToken.wrapped.is(destToken.wrapped)) {
          supplyInput = new common.TokenAmount(destToken.wrapped, srcAmount);
        }
        // 2-2. the src token is not equal to dest token
        else {
          const swapper = this.findSwapper([srcToken.wrapped, destToken.wrapped]);
          const swapInput = flashLoanAggregatorQuotation.loans.get(srcToken.wrapped);
          const swapQuotation = await swapper.quote({ input: swapInput, tokenOut: destToken.wrapped, slippage });
          const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
          output.logics.push(swapTokenLogic);
          // 2-2-1. the supply amount is the swap quotation output
          supplyInput = swapQuotation.output;
        }

        // 3. ---------- supply ----------
        const supplyLogic = protocol.newSupplyLogic({ marketId, input: supplyInput });
        // 3-1. if the src token is not equal to dest token, use BalanceLink to prevent swap slippage
        if (!srcToken.wrapped.is(destToken.wrapped)) {
          supplyLogic.fields.balanceBps = common.BPS_BASE;
        }
        output.logics.push(supplyLogic);
        output.afterPortfolio.supply(supplyInput.token, supplyInput.amount);
        // 3-2. set dest amount
        output.destAmount = supplyInput.amount;

        // 4. ---------- return funds ----------
        // 4-1. if protocol is collateral tokenized
        if (protocol.isAssetTokenized(marketId, supplyInput.token)) {
          // 4-1-1. return protocol token to user
          const returnFundsLogic = apisdk.protocols.utility.newSendTokenLogic({
            input: supplyLogic.fields.output!,
            recipient: account,
          });
          returnFundsLogic.fields.balanceBps = common.BPS_BASE;
          output.logics.push(returnFundsLogic);
        }

        // 5. ---------- borrow ----------
        const borrowOutput = flashLoanAggregatorQuotation.repays.get(srcToken.wrapped);
        const borrowLogic = protocol.newBorrowLogic({ marketId, output: borrowOutput });
        output.logics.push(borrowLogic);
        output.afterPortfolio.borrow(borrowOutput.token, borrowOutput.amount);

        // 6. append flash loan repay cube
        output.logics.push(flashLoanRepayLogic);
      }
    }

    return output;
  }

  // 1. flashloan destToken
  // 2. swap destToken to srcToken
  // 3. repay srcToken
  // 4. add fund aDestToken
  // 5. withdraw destToken
  // 6. flashloan repay destToken
  // @param srcToken Borrowed token, repaid token
  // @param destToken Deposit token, collateral token
  async deleverage({ account, portfolio, srcToken, srcAmount, destToken, slippage = defaultSlippage }: OperationInput) {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(srcAmount) > 0) {
      const { protocolId, marketId } = portfolio;
      const protocol = this.getProtocol(protocolId);
      const srcBorrow = portfolio.findBorrow(srcToken);
      const destCollateral = portfolio.findSupply(destToken);

      if (srcBorrow && destCollateral) {
        // 1. validate src amount
        if (new BigNumberJS(srcAmount).gt(srcBorrow.balances[0])) {
          output.error = { name: 'srcAmount', code: 'INSUFFICIENT_AMOUNT' };
        }
        output.afterPortfolio.repay(srcBorrow.token, srcAmount);

        if (!output.error) {
          // 2. scale src amount if user wants to repay all
          if (new BigNumberJS(srcAmount).eq(srcBorrow.balances[0])) {
            srcAmount = scaleRepayAmount(srcToken, srcAmount, slippage);
          }

          // 3. ---------- Pre-calc quotation ----------
          let flashLoanLoan: common.TokenAmount;
          let repayInput: common.TokenAmount;
          let swapper: Swapper | undefined;
          let swapQuotation: any;
          // 3-1. the src token is equal to dest token
          if (srcToken.wrapped.is(destToken.wrapped)) {
            // 3-1-1. the flash loan loan amount and repay amount are the src amount
            flashLoanLoan = new common.TokenAmount(destToken.wrapped, srcAmount);
            repayInput = new common.TokenAmount(srcToken.wrapped, srcAmount);
          }
          // 3-2. the src token is not equal to dest token
          else {
            swapper = this.findSwapper([destToken.wrapped, srcToken.wrapped]);
            // 3-2-1. get the quotation for how much dest token is needed to exchange for the src amount
            swapQuotation = await swapper.quote({
              tokenIn: destToken.wrapped,
              output: { token: srcToken.wrapped, amount: srcAmount },
            });
            // 3-2-2. convert swap type to exact in
            swapQuotation = await swapper.quote({ input: swapQuotation.input, tokenOut: srcToken.wrapped, slippage });
            // 3-2-3. the flash loan loan amount is the swap quotation input
            flashLoanLoan = swapQuotation.input;
            // 3-2-4. the repay amount is the swap quotation output
            repayInput = swapQuotation.output;
          }

          // 4. obtain the flash loan quotation
          const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(
            this.chainId,
            { loans: [flashLoanLoan] }
          );

          // 5. validate withdraw
          // 5-1. the withdraw output is the flash loan repay amount
          const withdrawOutput = flashLoanAggregatorQuotation.repays.get(destToken.wrapped);
          // 5-2. if protocol is collateral tokenized, add 2 wei
          if (protocol.isAssetTokenized(marketId, withdrawOutput.token)) {
            withdrawOutput.addWei(2);
          }
          // 5-3. validate dest collateral withdraw amount
          if (withdrawOutput.gt(destCollateral.balance)) {
            output.error = { name: 'destAmount', code: 'INSUFFICIENT_AMOUNT' };
          }
          output.afterPortfolio.withdraw(withdrawOutput.token, withdrawOutput.amount);
          // 5-4. set dest amount
          output.destAmount = withdrawOutput.amount;

          if (!output.error) {
            // 6. ---------- flashloan ----------
            const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
              flashLoanAggregatorQuotation.protocolId,
              flashLoanAggregatorQuotation.loans.toArray()
            );
            output.logics.push(flashLoanLoanLogic);

            // 7. ---------- swap ----------
            if (!srcToken.wrapped.is(destToken.wrapped) && swapper && swapQuotation) {
              const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
              output.logics.push(swapTokenLogic);
            }

            // 8. ---------- repay ----------
            const repayLogic = protocol.newRepayLogic({ marketId, account, input: repayInput });
            // 8-1. if the src token is not equal to dest token, use BalanceLink to prevent swap slippage
            if (!srcToken.wrapped.is(destToken.wrapped)) {
              repayLogic.fields.balanceBps = common.BPS_BASE;
            }
            output.logics.push(repayLogic);
            output.afterPortfolio.repay(repayInput.token, repayInput.amount);

            // 9. ---------- withdraw ----------
            const withdrawLogic = protocol.newWithdrawLogic({ marketId, output: withdrawOutput });
            // 9-1. if protocol is collateral tokenized
            if (protocol.isAssetTokenized(marketId, withdrawOutput.token)) {
              // 9-1-1. add src protocol token to agent
              const addFundsLogic = apisdk.protocols.permit2.newPullTokenLogic({ input: withdrawLogic.fields.input! });
              output.logics.push(addFundsLogic);

              // 9-1-2. use BalanceLink to prevent token shortages during the transfer
              withdrawLogic.fields.balanceBps = common.BPS_BASE;
            }
            // 9-2. append withdraw logic
            output.logics.push(withdrawLogic);

            // 10. append flashloan repay logic
            output.logics.push(flashLoanRepayLogic);
          }
        }
      }
    }

    return output;
  }

  // 1. swap srcToken to destToken
  // 2. supply destToken
  // @param srcToken Any token
  // @param destToken Deposit token, collateral token
  async zapSupply({ portfolio, srcToken, srcAmount, destToken, slippage = defaultSlippage }: OperationInput) {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(srcAmount) > 0) {
      const { protocolId, marketId } = portfolio;
      const protocol = this.getProtocol(protocolId);

      // 1. ---------- swap ----------
      let supplyInput: common.TokenAmount;
      // 1-1. the src token is equal to dest token
      if (srcToken.is(destToken)) {
        supplyInput = new common.TokenAmount(srcToken, srcAmount);
      }
      // 1-2. the src token is not equal to dest token
      else {
        const swapper = this.findSwapper([srcToken, destToken]);
        const swapQuotation = await swapper.quote({
          input: { token: srcToken, amount: srcAmount },
          tokenOut: destToken,
          slippage,
        });
        const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
        output.logics.push(swapTokenLogic);
        // 1-2-1. the supply amount is the swap quotation output
        supplyInput = swapQuotation.output;
      }

      // 2. ---------- supply ----------
      const supplyLogic = protocol.newSupplyLogic({ marketId, input: supplyInput });
      // 2-1. if the src token is not equal to dest token, use BalanceLink to prevent swap slippage
      if (!srcToken.is(destToken)) {
        supplyLogic.fields.balanceBps = common.BPS_BASE;
      }
      output.logics.push(supplyLogic);
      output.afterPortfolio.supply(supplyInput.token, supplyInput.amount);
      // 5-4. set dest amount
      output.destAmount = supplyInput.amount;
    }

    return output;
  }

  // 1. withdraw srcToken
  // 2. swap srcToken to destToken
  // @param srcToken Deposit token, collateral token
  // @param destToken Any token
  async zapWithdraw({ portfolio, srcToken, srcAmount, destToken, slippage = defaultSlippage }: OperationInput) {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(srcAmount) > 0) {
      const { protocolId, marketId } = portfolio;
      const protocol = this.getProtocol(protocolId);
      const srcCollateral = portfolio.findSupply(srcToken);

      if (srcCollateral) {
        // 1. validate src amount
        if (new BigNumberJS(srcAmount).gt(srcCollateral.balance)) {
          output.error = { name: 'srcAmount', code: 'INSUFFICIENT_AMOUNT' };
        }
        output.afterPortfolio.withdraw(srcCollateral.token, srcAmount);

        if (!output.error) {
          // 2. ---------- withdraw ----------
          const withdrawOutput = new common.TokenAmount(srcToken, srcAmount);
          const withdrawLogic = protocol.newWithdrawLogic({ marketId, output: withdrawOutput });
          // 2-1. use BalanceLink to prevent protocol token shortages during the transfer
          if (protocol.isAssetTokenized(marketId, withdrawOutput.token)) {
            withdrawLogic.fields.balanceBps = common.BPS_BASE;
          }
          output.logics.push(withdrawLogic);

          // 3. ---------- swap ----------
          // 3-1. the src token is equal to dest token
          if (srcToken.is(destToken)) {
            // 3-1-1. set dest amount
            output.destAmount = withdrawOutput.amount;
          }
          // 3-2. the src token is not equal to dest token
          else {
            const swapInput = withdrawOutput.clone();
            // 2-1. if asset is tokenized, sub 3 wei to prevent token shortages during the transfer
            if (protocol.isAssetTokenized(marketId, swapInput.token)) {
              swapInput.subWei(3);
            }
            const swapper = this.findSwapper([srcToken, destToken]);
            const swapQuotation = await swapper.quote({ input: swapInput, tokenOut: destToken, slippage });
            const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
            output.logics.push(swapTokenLogic);
            // 3-2-2. set dest amount
            output.destAmount = swapQuotation.output.amount;
          }
        }
      }
    }

    return output;
  }

  // 1. borrow srcToken
  // 2. swap srcToken to destToken
  // @param srcToken Borrowed token
  // @param destToken Any token
  async zapBorrow({ portfolio, srcToken, srcAmount, destToken, slippage = defaultSlippage }: OperationInput) {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(srcAmount) > 0) {
      const { protocolId, marketId } = portfolio;
      const protocol = this.getProtocol(protocolId);

      // 1. ---------- borrow ----------
      const borrowOutput = new common.TokenAmount(srcToken, srcAmount);
      const borrowLogic = protocol.newBorrowLogic({ marketId, output: borrowOutput });
      output.logics.push(borrowLogic);
      output.afterPortfolio.borrow(borrowOutput.token, borrowOutput.amount);

      // 2. ---------- swap ----------
      // 2-1. the src token is equal to dest token
      if (srcToken.is(destToken)) {
        // 2-1-1. set dest amount
        output.destAmount = borrowOutput.amount;
      }
      // 2-2. the src token is not equal to dest token
      else {
        const swapper = this.findSwapper([srcToken, destToken]);
        const swapQuotation = await swapper.quote({ input: borrowOutput, tokenOut: destToken, slippage });
        const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
        output.logics.push(swapTokenLogic);
        // 2-2-2. set dest amount
        output.destAmount = swapQuotation.output.amount;
      }
    }

    return output;
  }

  // 1. swap dest token to src token
  // 2. repay src token
  // @param srcToken Borrowed token, repaid token
  // @param destToken Any token
  async zapRepay({ account, portfolio, srcToken, srcAmount, destToken, slippage = defaultSlippage }: OperationInput) {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(srcAmount) > 0) {
      const { protocolId, marketId } = portfolio;
      const protocol = this.getProtocol(protocolId);
      const srcBorrow = portfolio.findBorrow(srcToken);

      if (srcBorrow) {
        // 1. validate src amount
        if (new BigNumberJS(srcAmount).gt(srcBorrow.balances[0])) {
          output.error = { name: 'srcAmount', code: 'INSUFFICIENT_AMOUNT' };
        }
        output.afterPortfolio.repay(srcBorrow.token, srcAmount);

        if (!output.error) {
          // 2. scale src amount if user wants to repay all
          if (new BigNumberJS(srcAmount).eq(srcBorrow.balances[0])) {
            srcAmount = scaleRepayAmount(srcToken, srcAmount, slippage);
          }

          // 3. ---------- swap ----------
          let repayInput: common.TokenAmount;
          // 3-1. the src token is equal to dest token
          if (srcToken.is(destToken)) {
            // 3-1-1. the repay amount is the src amount
            repayInput = new common.TokenAmount(srcToken, srcAmount);
            // 3-1-2. set dest amount
            output.destAmount = srcAmount;
          }
          // 3-2. the src token is not equal to dest token
          else {
            const swapper = this.findSwapper([srcToken, destToken]);
            // 3-2-1. get the quotation for how much dest token is needed to exchange for the src amount
            let swapQuotation = await swapper.quote({
              tokenIn: destToken,
              output: { token: srcToken, amount: srcAmount },
            });
            // 3-2-2. convert swap type to exact in
            swapQuotation = await swapper.quote({ input: swapQuotation.input, tokenOut: srcToken, slippage });
            const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
            output.logics.push(swapTokenLogic);
            // 3-2-3. the repay amount is the swap quotation output
            repayInput = swapQuotation.output;
            // 3-2-4. set dest amount
            output.destAmount = swapQuotation.input.amount;
          }

          // 4. ---------- repay ----------
          const repayLogic = await protocol.newRepayLogic({ marketId, account, input: repayInput });
          // 4-1. if the src token is not equal to dest token, use BalanceLink to prevent swap slippage
          if (!srcToken.is(destToken)) {
            repayLogic.fields.balanceBps = common.BPS_BASE;
          }
          output.logics.push(repayLogic);
          output.afterPortfolio.repay(repayInput.token, repayInput.amount);
        }
      }
    }

    return output;
  }
}
