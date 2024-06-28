import arbitrumTokensJSON from './data/arbitrum.json';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export const mainnetTokens = logics.radiantv2.mainnetTokens;

export const bnbTokens = common.bnbTokens;

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;

export const arbitrumTokens = {
  ...common.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON),
  ...logics.radiantv2.arbitrumTokens,
};
