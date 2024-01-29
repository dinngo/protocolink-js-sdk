import arbitrumTokensJSON from './data/arbitrum.json';
import avalancheTokensJSON from './data/avalanche.json';
import baseTokensJSON from './data/base.json';
import * as common from '@protocolink/common';
import gnosisTokensJSON from './data/gnosis.json';
import mainnetTokensJSON from './data/mainnet.json';
import metisTokensJSON from './data/metis.json';
import optimismTokensJSON from './data/optimism.json';
import polygonTokensJSON from './data/polygon.json';

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;
type AvalancheTokenSymbols = keyof typeof avalancheTokensJSON;
type BaseTokenSymbols = keyof typeof baseTokensJSON;
type GnosisTokenSymbols = keyof typeof gnosisTokensJSON;
type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;
type MetisTokenSymbols = keyof typeof metisTokensJSON;
type OptimismTokenSymbols = keyof typeof optimismTokensJSON;
type PolygonTokenSymbols = keyof typeof polygonTokensJSON;

export const arbitrumTokens = common.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON);
export const avalancheTokens = common.toTokenMap<AvalancheTokenSymbols>(avalancheTokensJSON);
export const baseTokens = common.toTokenMap<BaseTokenSymbols>(baseTokensJSON);
export const gnosisTokens = common.toTokenMap<GnosisTokenSymbols>(gnosisTokensJSON);
export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);
export const metisTokens = common.toTokenMap<MetisTokenSymbols>(metisTokensJSON);
export const optimismTokens = common.toTokenMap<OptimismTokenSymbols>(optimismTokensJSON);
export const polygonTokens = common.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON);
