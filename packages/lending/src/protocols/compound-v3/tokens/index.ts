import arbitrumTokensJSON from './data/arbitrum.json';
import baseTokensJSON from './data/base.json';
import * as common from '@protocolink/common';
import mainnetTokensJSON from './data/mainnet.json';
import polygonTokensJSON from './data/polygon.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);

type PolygonTokenSymbols = keyof typeof polygonTokensJSON;

export const polygonTokens = common.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON);

type BaseTokenSymbols = keyof typeof baseTokensJSON;

export const baseTokens = common.toTokenMap<BaseTokenSymbols>(baseTokensJSON);

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;

export const arbitrumTokens = common.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON);
