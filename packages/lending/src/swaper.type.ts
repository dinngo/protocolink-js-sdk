import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';

export enum TradeType {
  exactIn = 'exactIn',
  exactOut = 'exactOut',
}

export interface TokenToTokenExactInParams {
  input: common.TokenAmountObject;
  tokenOut: common.Token;
  slippage?: number;
}

export interface TokenToTokenExactOutParams {
  tokenIn: common.Token;
  output: common.TokenAmountObject;
  slippage?: number;
}

export type TokenToTokenParams = TokenToTokenExactInParams | TokenToTokenExactOutParams;

export type SwapTokenLogicParams =
  | apisdk.protocols.openoceanv2.SwapTokenParams
  | apisdk.protocols.paraswapv5.SwapTokenParams;

export function isTokenToTokenExactInParams(v: any): v is TokenToTokenExactInParams {
  return !!v.input && !!v.tokenOut;
}

export function isTokenToTokenExactOutParams(v: any): v is TokenToTokenExactOutParams {
  return !!v.tokenIn && !!v.output;
}

export interface TokenToTokenExactInFields {
  input: common.TokenAmountObject;
  output: common.TokenAmountObject;
  slippage?: number;
}

export interface TokenToTokenFields {
  tradeType: TradeType;
  input: common.TokenAmountObject;
  output: common.TokenAmountObject;
  slippage?: number;
}
