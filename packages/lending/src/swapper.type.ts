import * as core from '@protocolink/core';

export type SwapperQuoteParams = core.TokenToTokenParams<{ slippage?: number }>;

export type SwapperQuoteFields = core.TokenToTokenExactInFields<{ slippage?: number }>;
