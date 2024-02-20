import BigNumberJS from 'bignumber.js';
import {
  CloseOperationInput,
  OpenOperationInput,
  OperationError,
  OperationInput,
  OperationOutput,
} from './adapter.type';
import { Portfolio } from './protocol.portfolio';
import { Protocol, ProtocolClass } from './protocol';
import { Swapper, SwapperClass } from './swapper';
import { SwapperQuoteFields } from './swapper.type';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import { configMap } from './adapter.config';
import { defaultSlippage } from './protocol.type';
import flatten from 'lodash/flatten';
import { providers } from 'ethers';
import { scaleRepayAmount } from './adapter.utils';

export class Adapter extends common.Web3Toolkit {
  static Protocols: ProtocolClass[] = [];

  /**
   * Registers a new protocol to the Adapter.
   * @param {ProtocolClass} protocol - The protocol class to be registered.
   */
  static registerProtocol(protocol: ProtocolClass) {
    this.Protocols.push(protocol);
  }

  static Swappers: SwapperClass[] = [];

  /**
   * Registers a new swapper to the Adapter.
   * @param {SwapperClass} swapper - The swapper class to be registered.
   */
  static registerSwapper(swapper: SwapperClass) {
    this.Swappers.push(swapper);
  }

  protocolMap: Record<string, Protocol> = {};
  swappers: Swapper[] = [];

  constructor(chainId: number, provider?: providers.Provider) {
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

  /**
   * Chooses a suitable token based on the given options.
   *
   * @param {Object} options - The options for choosing a token.
   * @param {common.Token[]} options.tokens - The array of tokens to choose from.
   * @param {common.Token} [options.priorityToken] - A token that has priority if present in the tokens array. Optional.
   * @param {common.Token} [options.excludedToken] - A token to be excluded from selection. Optional.
   * @param {common.Token[]} [options.preferredTokens] - An array of preferred tokens. Optional.
   * @returns {common.Token} The chosen token based on the provided criteria.
   * If no specific criteria match, the first token from the tokens array is returned.
   */
  chooseSuitableToken(options: {
    tokens: common.Token[];
    priorityToken?: common.Token;
    excludedToken?: common.Token;
    preferredTokens?: common.Token[];
  }): common.Token {
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

  /**
   * Retrieves an array of portfolios for a given account from all registered protocols.
   *
   * @param {string} account - The account identifier for which portfolios are to be retrieved.
   * @returns {Promise<Portfolio[]>} A promise that resolves to an array of Portfolio objects from all protocols.
   */
  async getPortfolios(account: string): Promise<Portfolio[]> {
    const portfolios = await Promise.all(
      Object.values(this.protocolMap).map((protocol) => protocol.getPortfolios(account))
    );
    return flatten(portfolios);
  }

  /**
   * Retrieves the portfolio of a specific protocol and market for a given account.
   *
   * @param {string} account - The account identifier for which the portfolio is to be retrieved.
   * @param {string} protocolId - The identifier of the protocol.
   * @param {string} marketId - The identifier of the market within the protocol.
   * @returns {Promise<Portfolio>} A promise that resolves to the Portfolio object of the specified protocol and market.
   */
  async getPortfolio(account: string, protocolId: string, marketId: string): Promise<Portfolio> {
    return await this.protocolMap[protocolId].getPortfolio(account, marketId);
  }

  /**
   * Retrieves a protocol instance by its identifier.
   *
   * @param {string} id - The identifier of the protocol.
   * @returns {Protocol} The Protocol instance associated with the given identifier.
   */

  getProtocol(id: string): Protocol {
    return this.protocolMap[id];
  }

  /**
   * Open by collateral enables user to open collateral positions with any token.
   *
   * @param {OpenOperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.zapToken - Zap token: zap the token to the collateral.
   * @param {string} input.zapAmount - The amount of the zap token.
   * @param {common.Token} input.collateralToken - Collateral token: the collateral to be supplied.
   * @param {string} input.collateralAmount - The leverage amount of the collateral.
   * @param {common.Token} input.debtToken - Debt token: the debt to be borrowed.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. validate user inputs
   * 2. zap-supply zap token
   * 3. leverage by collateral token
   */
  async openByCollateral({
    account,
    portfolio,
    zapToken,
    zapAmount,
    collateralToken,
    collateralAmount,
    debtToken,
    slippage = defaultSlippage,
  }: OpenOperationInput): Promise<OperationOutput> {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(zapAmount) > 0) {
      const srcCollateral = portfolio.findSupply(collateralToken);
      const destBorrow = portfolio.findBorrow(debtToken);

      if (srcCollateral && destBorrow) {
        try {
          // 1. ---------- swap ----------
          const supplyInput = new common.TokenAmount(collateralToken.wrapped, '0');
          if (zapToken.is(collateralToken.wrapped)) {
            // 1-1-1. exclude native zapToken
            supplyInput.set(zapAmount);
          } else {
            const swapper = this.findSwapper([zapToken, collateralToken]);
            let swapQuotation: SwapperQuoteFields;
            try {
              swapQuotation = await swapper.quote({
                input: new common.TokenAmount(zapToken, zapAmount),
                tokenOut: collateralToken.wrapped,
                slippage,
              });
            } catch {
              throw new OperationError('zapAmount', 'NO_ROUTE_FOUND_OR_PRICE_IMPACT_TOO_HIGH');
            }
            const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
            output.logics.push(swapTokenLogic);
            // 1-2-1. the supply amount is the swap quotation output
            supplyInput.set(swapQuotation.output);
          }

          // 2. ---------- leverage ----------
          if (collateralAmount && Number(collateralAmount) > 0) {
            output.afterPortfolio.supply(supplyInput.token, supplyInput.amount);

            const leverageOutput = await this.leverageByCollateral({
              account,
              portfolio: output.afterPortfolio,
              srcToken: collateralToken.wrapped,
              srcAmount: collateralAmount,
              destToken: debtToken.wrapped,
            });

            if (leverageOutput.error) throw leverageOutput.error;

            // 2-1-1. find supply logic and add zap supply amount
            const logicIndex = collateralToken.wrapped.is(debtToken.wrapped) ? 1 : 2;
            const leverageSupplyAmount = leverageOutput.logics[logicIndex].fields.input;
            leverageOutput.logics[logicIndex].fields.input.amount = supplyInput.add(leverageSupplyAmount).amount;
            leverageOutput.logics[logicIndex].fields.balanceBps = common.BPS_BASE;
            output.logics.push(...leverageOutput.logics);
            output.afterPortfolio = leverageOutput.afterPortfolio;
            output.destAmount = leverageOutput.destAmount;
          }
        } catch (err) {
          output.error =
            err instanceof OperationError ? err : new OperationError('collateralAmount', 'UNEXPECTED_ERROR');
        }
      } else {
        output.error = new OperationError(srcCollateral ? 'debtAmount' : 'collateralAmount', 'UNSUPPORTED_TOKEN');
      }
    }

    return output;
  }

  /**
   * Open by debt enables user to open debt positions with any token.
   *
   * @param {OpenOperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.zapToken - Zap token: zap the token to the collateral.
   * @param {string} input.zapAmount - The amount of the zap token.
   * @param {common.Token} input.collateralToken - Collateral token: the collateral to be supplied.
   * @param {common.Token} input.debtToken - Debt token: the debt to be borrowed.
   * @param {string} input.debtAmount - The borrowed debt amount.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. validate user inputs
   * 2. zap-supply zap token
   * 3. leverage by debt token
   */
  async openByDebt({
    account,
    portfolio,
    zapToken,
    zapAmount,
    collateralToken,
    debtToken,
    debtAmount,
    slippage = defaultSlippage,
  }: OpenOperationInput): Promise<OperationOutput> {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(zapAmount) > 0) {
      const srcCollateral = portfolio.findSupply(collateralToken);
      const destBorrow = portfolio.findBorrow(debtToken);

      if (srcCollateral && destBorrow) {
        try {
          // 1. ---------- swap ----------
          const supplyInput = new common.TokenAmount(collateralToken.wrapped, '0');
          if (zapToken.is(collateralToken.wrapped)) {
            // 1-1-1. exclude native zapToken
            supplyInput.set(zapAmount);
          } else {
            const swapper = this.findSwapper([zapToken, collateralToken]);
            let swapQuotation: SwapperQuoteFields;
            try {
              swapQuotation = await swapper.quote({
                input: new common.TokenAmount(zapToken, zapAmount),
                tokenOut: collateralToken.wrapped,
                slippage,
              });
            } catch {
              throw new OperationError('zapAmount', 'NO_ROUTE_FOUND_OR_PRICE_IMPACT_TOO_HIGH');
            }
            const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
            output.logics.push(swapTokenLogic);
            // 1-2-1. the supply amount is the swap quotation output
            supplyInput.set(swapQuotation.output);
          }

          // 2. ---------- leverage ----------
          if (debtAmount && Number(debtAmount) > 0) {
            output.afterPortfolio.supply(supplyInput.token, supplyInput.amount);

            const leverageOutput = await this.leverageByDebt({
              account,
              portfolio: output.afterPortfolio,
              srcToken: debtToken.wrapped,
              srcAmount: debtAmount,
              destToken: collateralToken.wrapped,
            });

            if (leverageOutput.error) throw leverageOutput.error;

            // 2-1-1. find supply logic and add zap supply amount
            const logicIndex = collateralToken.wrapped.is(debtToken.wrapped) ? 1 : 2;
            const leverageSupplyAmount = leverageOutput.logics[logicIndex].fields.input;
            const totalSupplyAmount = leverageSupplyAmount.add(supplyInput).amount;
            leverageOutput.logics[logicIndex].fields.input.amount = totalSupplyAmount;
            leverageOutput.logics[logicIndex].fields.balanceBps = common.BPS_BASE;
            output.logics.push(...leverageOutput.logics);
            output.afterPortfolio = leverageOutput.afterPortfolio;
            output.destAmount = totalSupplyAmount;
          }
        } catch (err) {
          output.error = err instanceof OperationError ? err : new OperationError('debtAmount', 'UNEXPECTED_ERROR');
        }
      } else {
        output.error = new OperationError(srcCollateral ? 'debtAmount' : 'collateralAmount', 'UNSUPPORTED_TOKEN');
      }
    }
    return output;
  }

  /**
   * Close enables user to close supplied and borrowed positions.
   *
   * @param {CloseOperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.withdrawalToken - Withdrawal token: The token to be withdrawn.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. flashloan withdrawal token
   * 2. zap-repay withdrawl token
   * 3. zap-withdraw withdrawl token
   */
  async close({
    account,
    portfolio,
    withdrawalToken,
    slippage = defaultSlippage,
  }: CloseOperationInput): Promise<OperationOutput> {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    try {
      // 1. check borrow positions
      let flashLoanRepayLogic;
      const flashLoanLoan = new common.TokenAmount(withdrawalToken.wrapped, '0');
      const flashLoanRepay = flashLoanLoan.clone();
      const { protocolId, marketId } = portfolio;
      const protocol = this.getProtocol(protocolId);

      if (portfolio.totalBorrowUSD.gt(BigNumberJS(0))) {
        // 1.1 flashloan withdrawalToken to repay debt
        const borrows = portfolio.borrows;
        for (const borrow of borrows) {
          if (borrow.balance === '0') continue;

          const zapRepayOutput = await this.zapRepay({
            account,
            portfolio: output.afterPortfolio,
            srcToken: borrow.token,
            srcAmount: borrow.balance,
            destToken: withdrawalToken.wrapped,
            slippage,
            isRepayAll: true,
          });

          if (zapRepayOutput.error) throw zapRepayOutput.error;

          output.logics.push(...zapRepayOutput.logics);
          flashLoanLoan.add(zapRepayOutput.destAmount);
          output.afterPortfolio = zapRepayOutput.afterPortfolio;
        }

        const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(
          this.chainId,
          { loans: [flashLoanLoan], protocolId: protocol.preferredFlashLoanProtocolId }
        );
        flashLoanRepay.set(flashLoanAggregatorQuotation.repays.get(withdrawalToken.wrapped));

        const [loanLogic, repayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
          flashLoanAggregatorQuotation.protocolId,
          flashLoanAggregatorQuotation.loans.toArray()
        );
        output.logics.unshift(loanLogic);
        flashLoanRepayLogic = repayLogic;
      }

      // 2. check supply positions
      if (portfolio.totalSupplyUSD.gt(BigNumberJS(0))) {
        const supplies = output.afterPortfolio.supplies;
        const zapWithdraw = new common.TokenAmount(withdrawalToken.wrapped, '0');

        for (const supply of supplies) {
          if (supply.balance === '0') continue;

          const zapWithdrawOutput = await this.zapWithdraw({
            account,
            portfolio: output.afterPortfolio,
            srcToken: supply.token,
            srcAmount: supply.balance,
            destToken: withdrawalToken.wrapped,
            slippage,
          });

          if (zapWithdrawOutput.error) throw zapWithdrawOutput.error;

          // 2-1. if protocol is collateral tokenized
          if (protocol.isAssetTokenized(marketId, supply.token)) {
            // 2-1-1. add src protocol token to agent
            const withdrawLogic = zapWithdrawOutput.logics[0];
            const addFundsLogic = apisdk.protocols.permit2.newPullTokenLogic({
              input: withdrawLogic.fields.input!,
            });
            output.logics.push(addFundsLogic);
          }

          zapWithdraw.add(zapWithdrawOutput.destAmount);
          output.logics.push(...zapWithdrawOutput.logics);
          output.afterPortfolio = zapWithdrawOutput.afterPortfolio;
        }

        const withdrawal = new common.TokenAmount(withdrawalToken, zapWithdraw.clone().sub(flashLoanRepay).amount);
        output.destAmount = withdrawal.amount;

        if (flashLoanRepayLogic) output.logics.push(flashLoanRepayLogic);

        if (withdrawalToken.isNative && Number(withdrawal.amount) > 0) {
          const wrapNativeLogic = await apisdk.protocols.utility.newWrappedNativeTokenLogic({
            input: { token: zapWithdraw.token, amount: withdrawal.amount },
            output: withdrawal,
          });
          output.logics.push(wrapNativeLogic);
        }
      }
    } catch (err) {
      output.error = err instanceof OperationError ? err : new OperationError('close', 'UNEXPECTED_ERROR');
    }

    return output;
  }

  /**
   * Collateral swap enables user to replace one collateral asset
   * with another in a single step using a flash loan.
   *
   * @param {OperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.srcToken - Source token: the collateral to be swapped.
   * @param {string} input.srcAmount - The amount of source token.
   * @param {common.Token} input.destToken - Destination token: the collateral to be swapped to.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. validate src amount
   * 2. flashloan loan src token
   * 3. swap src token to dest token
   * 4. deposit dest token
   * 5. withdraw src token, if protocol is collateral tokenized, perform the following actions first:
   * 5-1. return dest protocol token to user
   * 5-2. add src protocol token to agent
   * 6. flashloan repay src token
   */
  async collateralSwap({
    account,
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
  }: OperationInput): Promise<OperationOutput> {
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
        output.afterPortfolio.withdraw(srcCollateral.token, srcAmount);

        try {
          // 1. validate withdraw
          if (!srcCollateral.validateWithdraw(srcAmount)) {
            throw new OperationError('srcAmount', 'INSUFFICIENT_AMOUNT');
          }

          // 2. ---------- Pre-calc quotation ----------
          // 2-1. utilize the src collateral withdraw amount as the flashloan repay amount
          // to reverse how much needs to be borrowed in the flashloan
          const flashLoanRepay = new common.TokenAmount(srcToken.wrapped, srcAmount);
          // 2-2. if protocol is collateral tokenized, sub 2 wei from the flashloan repay amount
          if (protocol.isAssetTokenized(marketId, srcToken)) {
            flashLoanRepay.subWei(2);
          }

          const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(
            this.chainId,
            { repays: [flashLoanRepay], protocolId: protocol.preferredFlashLoanProtocolId }
          );
          // 2-3. swap the flashloan borrow amount to dest collateral
          const swapper = this.findSwapper([srcToken.wrapped, destToken.wrapped]);
          let swapQuotation: SwapperQuoteFields;
          try {
            swapQuotation = await swapper.quote({
              input: flashLoanAggregatorQuotation.loans.get(srcToken.wrapped),
              tokenOut: destToken.wrapped,
              slippage,
            });
          } catch {
            throw new OperationError('destAmount', 'NO_ROUTE_FOUND_OR_PRICE_IMPACT_TOO_HIGH');
          }
          // 2-4. supply input is swap output
          const supplyInput = swapQuotation.output;
          output.afterPortfolio.supply(supplyInput.token, supplyInput.amount);
          // 2-5. set dest amount
          output.destAmount = supplyInput.amount;
          // 2-6. validate supply cap
          if (!destCollateral.validateSupplyCap(supplyInput.amount)) {
            throw new OperationError('destAmount', 'SUPPLY_CAP_EXCEEDED');
          }

          // 3. ---------- flashloan ----------
          const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
            flashLoanAggregatorQuotation.protocolId,
            flashLoanAggregatorQuotation.loans.toArray()
          );
          output.logics.push(flashLoanLoanLogic);

          // 4. ---------- swap ----------
          const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
          output.logics.push(swapTokenLogic);

          // 5. ---------- supply ----------
          const supplyLogic = protocol.newSupplyLogic({ marketId, input: supplyInput });
          // 5-1. use BalanceLink to prevent swap slippage
          supplyLogic.fields.balanceBps = common.BPS_BASE;
          output.logics.push(supplyLogic);

          // 6. ---------- withdraw ----------
          const withdrawOutput = new common.TokenAmount(srcToken.wrapped, srcAmount);
          const withdrawLogic = protocol.newWithdrawLogic({ marketId, output: withdrawOutput });
          // 6-1. if protocol is collateral tokenized
          if (protocol.isAssetTokenized(marketId, withdrawOutput.token)) {
            // 6-1-1. return dest protocol token to user
            const returnFundsLogic = apisdk.protocols.utility.newSendTokenLogic({
              input: supplyLogic.fields.output!,
              recipient: account,
            });
            returnFundsLogic.fields.balanceBps = common.BPS_BASE;
            output.logics.push(returnFundsLogic);

            // 6-1-2. add src protocol token to agent
            const addFundsLogic = apisdk.protocols.permit2.newPullTokenLogic({
              input: withdrawLogic.fields.input!,
            });
            output.logics.push(addFundsLogic);

            // 6-1-3. use BalanceLink to prevent token shortages during the transfer
            withdrawLogic.fields.balanceBps = common.BPS_BASE;
          }
          // 6-2. append withdraw logic
          output.logics.push(withdrawLogic);

          // 7. append flashloan repay logic
          output.logics.push(flashLoanRepayLogic);
        } catch (err) {
          output.error = err instanceof OperationError ? err : new OperationError('srcAmount', 'UNEXPECTED_ERROR');
        }
      } else {
        output.error = new OperationError(srcCollateral ? 'destAmount' : 'srcAmount', 'UNSUPPORTED_TOKEN');
      }
    }

    return output;
  }

  /**
   * Debt swap enables user to replace one loan asset with another in a single step using a flash loan
   *
   * @param {OperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.srcToken - Source token: the debt to be swapped.
   * @param {string} input.srcAmount - The amount of source token.
   * @param {common.Token} input.destToken - Destination token: the debt to be swapped to.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @param {boolean} [input.isRepayAll=false] - Flag to indicate if the entire debt should be repaid. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. flashloan dest token
   * 2. swap dest token to src token
   * 3. repay src token
   * 4. borrow dest token
   * 5. flashloan repay dest token
   */
  async debtSwap({
    account,
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
    isRepayAll = false,
  }: OperationInput): Promise<OperationOutput> {
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
        output.afterPortfolio.repay(srcBorrow.token, srcAmount);

        try {
          // 1. validate repay
          if (!srcBorrow.validateRepay(srcAmount)) {
            throw new OperationError('srcAmount', 'INSUFFICIENT_AMOUNT');
          }

          // 2. scale src amount if user wants to repay all
          if (isRepayAll || new BigNumberJS(srcAmount).eq(srcBorrow.balances[0])) {
            srcAmount = scaleRepayAmount(srcToken, srcAmount, slippage);
          }

          // 3. ---------- Pre-calc quotation ----------
          // 3-1. get the quotation for how much dest token is needed to exchange for the src amount
          const swapper = this.findSwapper([destToken.wrapped, srcToken.wrapped]);
          let swapQuotation: SwapperQuoteFields;
          try {
            swapQuotation = await swapper.quote({
              tokenIn: destToken.wrapped,
              output: new common.TokenAmount(srcToken.wrapped, srcAmount),
            });
            // 3-2. convert swap type to exact in
            swapQuotation = await swapper.quote({ input: swapQuotation.input, tokenOut: srcToken.wrapped, slippage });
          } catch {
            throw new OperationError('srcAmount', 'NO_ROUTE_FOUND_OR_PRICE_IMPACT_TOO_HIGH');
          }
          // 3-3.flash loan dest amount and insert before swap token logic
          const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(
            this.chainId,
            { loans: [swapQuotation.input], protocolId: protocol.preferredFlashLoanProtocolId }
          );
          // 3-4. borrow output is flash loan repay
          const borrowOutput = flashLoanAggregatorQuotation.repays.get(destToken.wrapped);
          output.afterPortfolio.borrow(borrowOutput.token, borrowOutput.amount);
          // 3-5. set dest amount
          output.destAmount = borrowOutput.amount;
          // 3-6. validate borrow cap
          if (!destBorrow.validateBorrowCap(borrowOutput.amount)) {
            throw new OperationError('destAmount', 'BORROW_CAP_EXCEEDED');
          }

          // 4. ---------- flashloan ----------
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
          const borrowLogic = protocol.newBorrowLogic({ marketId, output: borrowOutput });
          output.logics.push(borrowLogic);

          // 8. append flashloan repay logic
          output.logics.push(flashLoanRepayLogic);
        } catch (err) {
          output.error = err instanceof OperationError ? err : new OperationError('srcAmount', 'UNEXPECTED_ERROR');
        }
      } else {
        output.error = new OperationError(srcBorrow ? 'destAmount' : 'srcAmount', 'UNSUPPORTED_TOKEN');
      }
    }

    return output;
  }

  /**
   * Leverage collateral enables user to achieve the desired collateral exposure in a single step using a flash loan.
   *
   * @param {OperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.srcToken - Source token: the collateral token to be leveraged.
   * @param {string} input.srcAmount - The amount of source token.
   * @param {common.Token} input.destToken - Destination token: the debt token to be leveraged against.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. flashloan destToken
   * 2. swap destToken to srcToken
   * 3. deposit srcToken, get aSrcToken
   * 4. return funds aSrcToken to user
   * 5. borrow destToken
   * 6. flashloan repay destToken
   */
  async leverageByCollateral({
    account,
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
  }: OperationInput): Promise<OperationOutput> {
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
        try {
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
            try {
              // 1-2-1. retrieve the amount needed to borrow based on the collateral token and amount
              swapQuotation = await swapper.quote({
                tokenIn: destToken.wrapped,
                output: new common.TokenAmount(srcToken.wrapped, srcAmount),
              });
              // 1-2-2. convert swap type to exact in
              swapQuotation = await swapper.quote({ input: swapQuotation.input, tokenOut: srcToken.wrapped, slippage });
            } catch {
              throw new OperationError('srcAmount', 'NO_ROUTE_FOUND_OR_PRICE_IMPACT_TOO_HIGH');
            }
            // 1-2-3. the flash loan loan amount is the swap quotation input
            flashLoanLoan = swapQuotation.input;
            // 1-2-4. the supply amount is the swap quotation output
            supplyInput = swapQuotation.output;
          }
          output.afterPortfolio.supply(supplyInput.token, supplyInput.amount);
          // 1-3. validate supply cap
          if (!srcCollateral.validateSupplyCap(supplyInput.amount)) {
            throw new OperationError('srcAmount', 'SUPPLY_CAP_EXCEEDED');
          }

          // 1-4. get flash loan quotation
          const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(
            this.chainId,
            { loans: [flashLoanLoan], protocolId: protocol.preferredFlashLoanProtocolId }
          );
          // 1-5. borrow output is flash loan repay
          const borrowOutput = flashLoanAggregatorQuotation.repays.get(destToken.wrapped);
          output.afterPortfolio.borrow(borrowOutput.token, borrowOutput.amount);
          // 1-6. set dest amount
          output.destAmount = borrowOutput.amount;
          // 1-7. validate borrow cap
          if (!destBorrow.validateBorrowCap(borrowOutput.amount)) {
            throw new OperationError('destAmount', 'BORROW_CAP_EXCEEDED');
          }

          // 2. ---------- flashloan ----------
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
          const borrowLogic = protocol.newBorrowLogic({ marketId, output: borrowOutput });
          output.logics.push(borrowLogic);

          // 7. append flash loan repay cube
          output.logics.push(flashLoanRepayLogic);
        } catch (err) {
          output.error = err instanceof OperationError ? err : new OperationError('srcAmount', 'UNEXPECTED_ERROR');
        }
      } else {
        output.error = new OperationError(srcCollateral ? 'destAmount' : 'srcAmount', 'UNSUPPORTED_TOKEN');
      }
    }

    return output;
  }

  /**
   * Leverage debt enables user to achieve the desired debt exposure in a single step using a flash loan.
   *
   * @param {OperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.srcToken - Source token: the debt token to be leveraged.
   * @param {string} input.srcAmount - The amount of source token.
   * @param {common.Token} input.destToken - Destination token: the collateral token to be leveraged against.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. flashloan srcToken
   * 2. swap srcToken to destToken
   * 3. deposit destToken, get aDestToken
   * 4. return funds aDestToken to user
   * 5. borrow srcToken
   * 6. flashloan repay srcToken
   */
  async leverageByDebt({
    account,
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
  }: OperationInput): Promise<OperationOutput> {
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
        try {
          // 1. ---------- Pre-calc quotation ----------
          // 1-1. get flash loan quotation
          const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(
            this.chainId,
            {
              loans: [{ token: srcToken.wrapped, amount: srcAmount }],
              protocolId: protocol.preferredFlashLoanProtocolId,
            }
          );
          // 1-2. borrow output is flash loan repay
          const borrowOutput = flashLoanAggregatorQuotation.repays.get(srcToken.wrapped);
          output.afterPortfolio.borrow(borrowOutput.token, borrowOutput.amount);
          // 1-3. validate borrow cap
          if (!srcBorrow.validateBorrowCap(borrowOutput.amount)) {
            throw new OperationError('srcAmount', 'BORROW_CAP_EXCEEDED');
          }

          let supplyInput: common.TokenAmount;
          let swapper: Swapper | undefined;
          let swapQuotation: any;
          // 1-4. the src token is equal to dest token
          if (srcToken.wrapped.is(destToken.wrapped)) {
            supplyInput = new common.TokenAmount(destToken.wrapped, srcAmount);
          }
          // 1-5. the src token is not equal to dest token
          else {
            swapper = this.findSwapper([srcToken.wrapped, destToken.wrapped]);
            const swapInput = flashLoanAggregatorQuotation.loans.get(srcToken.wrapped);
            try {
              swapQuotation = await swapper.quote({ input: swapInput, tokenOut: destToken.wrapped, slippage });
            } catch {
              throw new OperationError('destAmount', 'NO_ROUTE_FOUND_OR_PRICE_IMPACT_TOO_HIGH');
            }
            // 1-5-1. the supply amount is the swap quotation output
            supplyInput = swapQuotation.output;
          }
          output.afterPortfolio.supply(supplyInput.token, supplyInput.amount);
          // 1-6. set dest amount
          output.destAmount = supplyInput.amount;
          // 1-7. validate supply cap
          if (!destCollateral.validateSupplyCap(supplyInput.amount)) {
            throw new OperationError('destAmount', 'SUPPLY_CAP_EXCEEDED');
          }

          // 2. ---------- flashloan ----------
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
          const borrowLogic = protocol.newBorrowLogic({ marketId, output: borrowOutput });
          output.logics.push(borrowLogic);

          // 7. append flash loan repay cube
          output.logics.push(flashLoanRepayLogic);
        } catch (err) {
          output.error = err instanceof OperationError ? err : new OperationError('srcAmount', 'UNEXPECTED_ERROR');
        }
      } else {
        output.error = new OperationError(srcBorrow ? 'destAmount' : 'srcAmount', 'UNSUPPORTED_TOKEN');
      }
    }

    return output;
  }

  /**
   * Deleverage enables user to reduce the collateral exposure in a single step using a flash loan to
   * repay the borrowed asset.
   *
   * @param {OperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.srcToken - Source token: the debt token.
   * @param {string} input.srcAmount - The amount of source token.
   * @param {common.Token} input.destToken - Destination token: the collateral token.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @param {boolean} [input.isRepayAll=false] - Flag to indicate if the entire debt should be repaid. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. flashloan destToken
   * 2. swap destToken to srcToken
   * 3. repay srcToken
   * 4. add fund aDestToken
   * 5. withdraw destToken
   * 6. flashloan repay destToken
   */
  async deleverage({
    account,
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
    isRepayAll = false,
  }: OperationInput): Promise<OperationOutput> {
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
        output.afterPortfolio.repay(srcBorrow.token, srcAmount);

        try {
          // 1. validate repay
          if (!srcBorrow.validateRepay(srcAmount)) {
            throw new OperationError('srcAmount', 'INSUFFICIENT_AMOUNT');
          }

          // 2. ---------- Pre-calc quotation ----------
          let flashLoanLoan: common.TokenAmount;
          let repayInput: common.TokenAmount;
          let swapper: Swapper | undefined;
          let swapQuotation: any;
          // 2-1. the src token is equal to dest token
          if (srcToken.wrapped.is(destToken.wrapped)) {
            // 2-1-1. scale src amount if user wants to repay all
            if (isRepayAll || new BigNumberJS(srcAmount).eq(srcBorrow.balances[0])) {
              srcAmount = scaleRepayAmount(srcToken, srcAmount, 1);
            }
            // 2-1-2. the flash loan loan amount and repay amount are the src amount
            flashLoanLoan = new common.TokenAmount(destToken.wrapped, srcAmount);
            repayInput = new common.TokenAmount(srcToken.wrapped, srcAmount);
          }
          // 2-2. the src token is not equal to dest token
          else {
            // 2-2-1. scale src amount if user wants to repay all
            if (isRepayAll || new BigNumberJS(srcAmount).eq(srcBorrow.balances[0])) {
              srcAmount = scaleRepayAmount(srcToken, srcAmount, slippage);
            }
            swapper = this.findSwapper([destToken.wrapped, srcToken.wrapped]);
            // 2-2-2. get the quotation for how much dest token is needed to exchange for the src amount
            try {
              swapQuotation = await swapper.quote({
                tokenIn: destToken.wrapped,
                output: new common.TokenAmount(srcToken.wrapped, srcAmount),
              });
              // 2-2-3. convert swap type to exact in
              swapQuotation = await swapper.quote({ input: swapQuotation.input, tokenOut: srcToken.wrapped, slippage });
            } catch {
              throw new OperationError('srcAmount', 'NO_ROUTE_FOUND_OR_PRICE_IMPACT_TOO_HIGH');
            }
            // 2-2-4. the flash loan loan amount is the swap quotation input
            flashLoanLoan = swapQuotation.input;
            // 2-2-5. the repay amount is the swap quotation output
            repayInput = swapQuotation.output;
          }

          // 3. obtain the flash loan quotation
          const flashLoanAggregatorQuotation = await apisdk.protocols.utility.getFlashLoanAggregatorQuotation(
            this.chainId,
            { loans: [flashLoanLoan], protocolId: protocol.preferredFlashLoanProtocolId }
          );

          // 4. validate withdraw
          // 4-1. the withdraw output is the flash loan repay amount
          const withdrawOutput = flashLoanAggregatorQuotation.repays.get(destToken.wrapped);
          // 4-2. if protocol is collateral tokenized, add 2 wei
          if (protocol.isAssetTokenized(marketId, withdrawOutput.token)) {
            withdrawOutput.addWei(2);
          }
          output.afterPortfolio.withdraw(withdrawOutput.token, withdrawOutput.amount);
          // 4-3. set dest amount
          output.destAmount = withdrawOutput.amount;
          // 4-4. validate dest collateral withdraw amount
          if (!destCollateral.validateWithdraw(withdrawOutput.amount)) {
            throw new OperationError('destAmount', 'INSUFFICIENT_AMOUNT');
          }

          // 5. ---------- flashloan ----------
          const [flashLoanLoanLogic, flashLoanRepayLogic] = apisdk.protocols.utility.newFlashLoanAggregatorLogicPair(
            flashLoanAggregatorQuotation.protocolId,
            flashLoanAggregatorQuotation.loans.toArray()
          );
          output.logics.push(flashLoanLoanLogic);

          // 6. ---------- swap ----------
          if (!srcToken.wrapped.is(destToken.wrapped) && swapper && swapQuotation) {
            const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
            output.logics.push(swapTokenLogic);
          }

          // 7. ---------- repay ----------
          const repayLogic = protocol.newRepayLogic({ marketId, account, input: repayInput });
          // 7-1. if the src token is not equal to dest token, use BalanceLink to prevent swap slippage
          if (!srcToken.wrapped.is(destToken.wrapped)) {
            repayLogic.fields.balanceBps = common.BPS_BASE;
          }
          output.logics.push(repayLogic);

          // 8. ---------- withdraw ----------
          const withdrawLogic = protocol.newWithdrawLogic({ marketId, output: withdrawOutput });
          // 8-1. if protocol is collateral tokenized
          if (protocol.isAssetTokenized(marketId, withdrawOutput.token)) {
            // 8-1-1. add src protocol token to agent
            const addFundsLogic = apisdk.protocols.permit2.newPullTokenLogic({
              input: withdrawLogic.fields.input!,
            });
            output.logics.push(addFundsLogic);

            // 8-1-2. use BalanceLink to prevent token shortages during the transfer
            withdrawLogic.fields.balanceBps = common.BPS_BASE;
          }
          // 8-2. append withdraw logic
          output.logics.push(withdrawLogic);

          // 9. append flashloan repay logic
          output.logics.push(flashLoanRepayLogic);
        } catch (err) {
          output.error = err instanceof OperationError ? err : new OperationError('srcAmount', 'UNEXPECTED_ERROR');
        }
      } else {
        output.error = new OperationError(srcBorrow ? 'destAmount' : 'srcAmount', 'UNSUPPORTED_TOKEN');
      }
    }

    return output;
  }

  /**
   * Zap supply enables user to swap any token to supply token in one transaction.
   *
   * @param {OperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.srcToken - Source token: the token to be provided by user.
   * @param {string} input.srcAmount - The amount of source token.
   * @param {common.Token} input.destToken - Destination token: the token to be supplied to lending protocol.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. swap srcToken to destToken
   * 2. supply destToken
   */
  async zapSupply({
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
  }: OperationInput): Promise<OperationOutput> {
    const output: OperationOutput = {
      destAmount: '0',
      afterPortfolio: portfolio.clone(),
      logics: [],
    };

    if (Number(srcAmount) > 0) {
      const { protocolId, marketId } = portfolio;
      const protocol = this.getProtocol(protocolId);
      const destCollateral = portfolio.findSupply(destToken);

      if (destCollateral) {
        try {
          // 1. ---------- swap ----------
          let supplyInput: common.TokenAmount;
          // 1-1. the src token is equal to dest token
          if (srcToken.wrapped.is(destToken.wrapped)) {
            supplyInput = new common.TokenAmount(srcToken, srcAmount);
          }
          // 1-2. the src token is not equal to dest token
          else {
            const swapper = this.findSwapper([srcToken, destToken]);
            let swapQuotation: SwapperQuoteFields;
            try {
              swapQuotation = await swapper.quote({
                input: new common.TokenAmount(srcToken, srcAmount),
                tokenOut: destToken.wrapped,
                slippage,
              });
            } catch {
              throw new OperationError('destAmount', 'NO_ROUTE_FOUND_OR_PRICE_IMPACT_TOO_HIGH');
            }
            const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
            output.logics.push(swapTokenLogic);
            // 1-2-1. the supply amount is the swap quotation output
            supplyInput = swapQuotation.output;
          }
          output.afterPortfolio.supply(supplyInput.token, supplyInput.amount);
          // 1-3. set dest amount
          output.destAmount = supplyInput.amount;

          // 2. validate supply cap
          if (!destCollateral.validateSupplyCap(supplyInput.amount)) {
            throw new OperationError('destAmount', 'SUPPLY_CAP_EXCEEDED');
          }

          // 3. ---------- supply ----------
          const supplyLogic = protocol.newSupplyLogic({ marketId, input: supplyInput });
          // 3-1. if the src token is not equal to dest token, use BalanceLink to prevent swap slippage
          if (!srcToken.wrapped.is(destToken.wrapped)) {
            supplyLogic.fields.balanceBps = common.BPS_BASE;
          }
          output.logics.push(supplyLogic);
        } catch (err) {
          output.error = err instanceof OperationError ? err : new OperationError('srcAmount', 'UNEXPECTED_ERROR');
        }
      } else {
        output.error = new OperationError('destAmount', 'UNSUPPORTED_TOKEN');
      }
    }

    return output;
  }

  /**
   * Zap withdraw enables user to withdraw then swap to any token in one transaction.
   *
   * @param {OperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.srcToken - Source token: the token to be withdrawn from lending platform.
   * @param {string} input.srcAmount - The amount of source token.
   * @param {common.Token} input.destToken - the token that user receives.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. withdraw srcToken
   * 2. swap srcToken to destToken
   */
  async zapWithdraw({
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
  }: OperationInput): Promise<OperationOutput> {
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
        output.afterPortfolio.withdraw(srcCollateral.token, srcAmount);

        try {
          // 1. validate src amount
          if (!srcCollateral.validateWithdraw(srcAmount)) {
            throw new OperationError('srcAmount', 'INSUFFICIENT_AMOUNT');
          }

          // 2. ---------- withdraw ----------
          const withdrawalToken = srcToken.wrapped.is(destToken.wrapped) ? destToken : srcToken.wrapped;
          const withdrawOutput = new common.TokenAmount(withdrawalToken, srcAmount);

          // 3. ---------- swap ----------
          // 3-1. the src token is equal to dest token
          if (srcToken.wrapped.is(destToken.wrapped)) {
            // 3-1-1. set dest amount
            output.destAmount = withdrawOutput.amount;
          }
          // 3-2. the src token is not equal to dest token
          else {
            const swapInput = withdrawOutput.clone();
            // 3-2-1. if asset is tokenized, sub 3 wei to prevent token shortages during the transfer
            if (protocol.isAssetTokenized(marketId, swapInput.token)) {
              swapInput.subWei(3);
            }
            const swapper = this.findSwapper([srcToken, destToken]);
            let swapQuotation: SwapperQuoteFields;
            try {
              swapQuotation = await swapper.quote({ input: swapInput, tokenOut: destToken, slippage });
            } catch {
              throw new OperationError('destAmount', 'NO_ROUTE_FOUND_OR_PRICE_IMPACT_TOO_HIGH');
            }
            const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
            output.logics.push(swapTokenLogic);
            // 3-2-2. set dest amount
            output.destAmount = swapQuotation.output.amount;
          }

          // 4. unshift withdraw logic
          const withdrawLogic = protocol.newWithdrawLogic({ marketId, output: withdrawOutput });
          // 4-1. use BalanceLink to prevent protocol token shortages during the transfer
          if (protocol.isAssetTokenized(marketId, withdrawOutput.token)) {
            withdrawLogic.fields.balanceBps = common.BPS_BASE;
          }
          output.logics.unshift(withdrawLogic);
        } catch (err) {
          output.error = err instanceof OperationError ? err : new OperationError('srcAmount', 'UNEXPECTED_ERROR');
        }
      } else {
        output.error = new OperationError('srcAmount', 'UNSUPPORTED_TOKEN');
      }
    }

    return output;
  }

  /**
   * Zap borrow enables user to borrow then swap to any token in one transaction.
   *
   * @param {OperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.srcToken - Source token: the token to be borrowed from lending platform.
   * @param {string} input.srcAmount - The amount of source token.
   * @param {common.Token} input.destToken - Destination token: the token that user receives.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. borrow srcToken
   * 2. swap srcToken to destToken
   */
  async zapBorrow({
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
  }: OperationInput): Promise<OperationOutput> {
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
        output.afterPortfolio.borrow(srcToken, srcAmount);

        try {
          // 1. validate borrow min
          if (!srcBorrow.validateBorrowMin(srcAmount)) {
            throw new OperationError('srcAmount', 'BORROW_MIN');
          } else if (!srcBorrow.validateBorrowCap(srcAmount)) {
            throw new OperationError('srcAmount', 'BORROW_CAP_EXCEEDED');
          }

          // 2. ---------- borrow ----------
          const borrowToken = srcToken.wrapped.is(destToken.wrapped) ? destToken : srcToken.wrapped;
          const borrowOutput = new common.TokenAmount(borrowToken, srcAmount);

          // 3. ---------- swap ----------
          // 3-1. the src token is equal to dest token
          if (srcToken.wrapped.is(destToken.wrapped)) {
            // 2-1-1. set dest amount
            output.destAmount = borrowOutput.amount;
          }
          // 3-2. the src token is not equal to dest token
          else {
            const swapper = this.findSwapper([srcToken, destToken]);
            let swapQuotation: SwapperQuoteFields;
            try {
              swapQuotation = await swapper.quote({ input: borrowOutput, tokenOut: destToken, slippage });
            } catch {
              throw new OperationError('destAmount', 'NO_ROUTE_FOUND_OR_PRICE_IMPACT_TOO_HIGH');
            }
            const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
            output.logics.push(swapTokenLogic);
            // 3-2-1. set dest amount
            output.destAmount = swapQuotation.output.amount;
          }

          // 4. unshift borrow logic
          const borrowLogic = protocol.newBorrowLogic({ marketId, output: borrowOutput });
          output.logics.unshift(borrowLogic);
        } catch (err) {
          output.error = err instanceof OperationError ? err : new OperationError('srcAmount', 'UNEXPECTED_ERROR');
        }
      } else {
        output.error = new OperationError('srcAmount', 'UNSUPPORTED_TOKEN');
      }
    }

    return output;
  }

  /**
   * Zap repay enables user to swap any token to repay the debt in one transaction.
   *
   * @param {OperationInput} input - The input parameters for the operation.
   * @param {string} input.account - The account wallet address.
   * @param {Portfolio} input.portfolio - The portfolio data.
   * @param {common.Token} input.srcToken - Source token: the debt token to be repaid.
   * @param {string} input.srcAmount - The amount of source token.
   * @param {common.Token} input.destToken - Destination token: the token to be provided by user.
   * @param {number} [input.slippage=defaultSlippage] - The slippage tolerance. Optional.
   * @param {boolean} [input.isRepayAll=false] - Flag to indicate if the entire debt should be repaid. Optional.
   * @returns {Promise<OperationOutput>} The result including the destination amount,
   * after portfolio, potential errors, and logic operations.
   *
   * 1. swap dest token to src token
   * 2. repay src token
   */
  async zapRepay({
    account,
    portfolio,
    srcToken,
    srcAmount,
    destToken,
    slippage = defaultSlippage,
    isRepayAll = false,
  }: OperationInput): Promise<OperationOutput> {
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
        output.afterPortfolio.repay(srcBorrow.token, srcAmount);

        try {
          // 1. validate repay
          if (!srcBorrow.validateRepay(srcAmount)) {
            throw new OperationError('srcAmount', 'INSUFFICIENT_AMOUNT');
          }

          // 2. ---------- swap ----------
          let repayInput: common.TokenAmount;
          // 2-1. the src token is equal to dest token
          if (srcToken.wrapped.is(destToken.wrapped)) {
            // 2-1-1. set dest amount
            output.destAmount = srcAmount;
            // 2-1-2. scale src amount if user wants to repay all
            if (isRepayAll || new BigNumberJS(srcAmount).eq(srcBorrow.balances[0])) {
              srcAmount = scaleRepayAmount(srcToken, srcAmount, 1);
            }
            // 2-1-3. the repay amount is the src amount
            repayInput = new common.TokenAmount(destToken, srcAmount);
          }
          // 2-2. the src token is not equal to dest token
          else {
            const swapper = this.findSwapper([destToken, srcToken.wrapped]);
            // 2-2-1. scale src amount if user wants to repay all
            if (isRepayAll || new BigNumberJS(srcAmount).eq(srcBorrow.balances[0])) {
              srcAmount = scaleRepayAmount(srcToken, srcAmount, slippage);
            }
            let swapQuotation: SwapperQuoteFields;
            try {
              // 2-2-2. get the quotation for how much dest token is needed to exchange for the src amount
              swapQuotation = await swapper.quote({
                tokenIn: destToken,
                output: new common.TokenAmount(srcToken.wrapped, srcAmount),
              });
              // 2-2-3. convert swap type to exact in
              swapQuotation = await swapper.quote({ input: swapQuotation.input, tokenOut: srcToken.wrapped, slippage });
            } catch {
              throw new OperationError('srcAmount', 'NO_ROUTE_FOUND_OR_PRICE_IMPACT_TOO_HIGH');
            }
            const swapTokenLogic = swapper.newSwapTokenLogic(swapQuotation);
            output.logics.push(swapTokenLogic);
            // 2-2-4. the repay amount is the swap quotation output
            repayInput = swapQuotation.output;
            // 2-2-5. set dest amount
            output.destAmount = swapQuotation.input.amount;
          }

          // 3. ---------- repay ----------
          const repayLogic = protocol.newRepayLogic({ marketId, account, input: repayInput });
          // 3-1. if the src token is not equal to dest token, use BalanceLink to prevent swap slippage
          if (!srcToken.wrapped.is(destToken.wrapped)) {
            repayLogic.fields.balanceBps = common.BPS_BASE;
          }
          output.logics.push(repayLogic);
        } catch (err) {
          output.error = err instanceof OperationError ? err : new OperationError('srcAmount', 'UNEXPECTED_ERROR');
        }
      } else {
        output.error = new OperationError('srcAmount', 'UNSUPPORTED_TOKEN');
      }
    }

    return output;
  }
}
