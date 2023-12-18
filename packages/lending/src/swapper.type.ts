import * as common from '@protocolink/common';
import * as core from '@protocolink/core';

export type SwapperQuoteParams = common.Declasifying<core.TokenToTokenParams<{ slippage?: number }>>;

export type SwapperQuoteFields = core.TokenToTokenExactInFields<{ slippage?: number }>;
