import * as common from '@protocolink/common';

export interface GlobalOptions {
  readonly account: string;
}

export enum WrapMode {
  none = 0,
  wrapBefore = 1,
  unwrapAfter = 2,
}

export enum TradeType {
  exactIn = 'exactIn',
  exactOut = 'exactOut',
}

// Parameters are input to or output from a source external to the process.
// Fields identify the inputs and outputs of an activity.

export type TokenToTokenExactInParams<T = object> = {
  input: common.TokenAmount;
  tokenOut: common.Token;
} & T;

export type TokenToTokenExactOutParams<T = object> = {
  tokenIn: common.Token;
  output: common.TokenAmount;
} & T;

export type TokenToTokenParams<T = object> = (TokenToTokenExactInParams | TokenToTokenExactOutParams) & T;

export function isTokenToTokenExactInParams<T = object>(v: any): v is TokenToTokenExactInParams<T> {
  return !!v.input && !!v.tokenOut;
}

export function isTokenToTokenExactOutParams<T = object>(v: any): v is TokenToTokenExactOutParams<T> {
  return !!v.tokenIn && !!v.output;
}

export type TokenToTokenExactInFields<T = object> = {
  input: common.TokenAmount;
  output: common.TokenAmount;
  balanceBps?: number;
} & T;

export type TokenToTokenFields<T = object> = {
  tradeType: TradeType;
  input: common.TokenAmount;
  output: common.TokenAmount;
  balanceBps?: number;
} & T;

export type TokenInParams<T = object> = { tokenIn: common.Token } & T;

export type TokenInFields<T = object> = { input: common.TokenAmount; balanceBps?: number } & T;

export type TokensInFields<T = object> = {
  inputs: common.TokenAmounts;
  amountsBps?: Record<number, number>;
} & T;

export type TokenOutParams<T = object> = { tokenOut: common.Token } & T;

export type TokenOutFields<T = object> = { output: common.TokenAmount } & T;

export type TokensOutFields<T = object> = { outputs: common.TokenAmounts } & T;

export type TokenToUserFields<T = object> = {
  input: common.TokenAmount;
  recipient: string;
  balanceBps?: number;
} & T;

export type RepayParams<T = object> = TokenInParams<{ borrower: string }> & T;

export type RepayFields<T = object> = TokenInFields<{ borrower: string }> & T;

export type ClaimParams<T = object> = { owner: string } & T;

export type ClaimFields<T = object> = TokenOutFields<{ owner: string }> & T;

export type FlashLoanFields<T = object> = TokensOutFields<{ params: string }> & T;
