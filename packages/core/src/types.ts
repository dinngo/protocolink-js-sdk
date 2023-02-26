import { BigNumberish } from 'ethers';
import * as common from '@composable-router/common';

export interface GlobalOptions {
  readonly account: string;
  readonly funds: common.TokenAmounts;
  readonly balances: common.TokenAmounts;
  readonly slippage: number;
}

// Parameters are input to or output from a source external to the process.

export type TokenToTokenExactInParams<T = object> = {
  input: common.TokenAmount;
  tokenOut: common.Token;
} & T;

export type TokenToTokenExactOutParams<T = object> = {
  tokenIn: common.Token;
  output: common.TokenAmount;
} & T;

// Fields identify the inputs and outputs of an activity.

export type TokenInFields<T = object> = { input: common.TokenAmount; amountBps?: BigNumberish } & T;
export type TokensInFields<T = object> = { inputs: common.TokenAmounts } & T;

export type TokenOutFields<T = object> = { output: common.TokenAmount } & T;
export type TokensOutFields<T = object> = { outputs: common.TokenAmounts } & T;

export type TokenToTokenFields<T = object> = {
  input: common.TokenAmount;
  output: common.TokenAmount;
  amountBps?: BigNumberish;
} & T;

export type TokenToUserFields<T = object> = {
  input: common.TokenAmount;
  recipient: string;
  amountBps?: BigNumberish;
} & T;

export type ClaimTokenFields<T = object> = { owner: string } & T;

export type FlashLoanFields<T = object> = TokensOutFields<{ params: string }> & T;
