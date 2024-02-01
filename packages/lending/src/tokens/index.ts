import arbitrumTokensJSON from './arbitrum.json';
import avalancheTokensJSON from './avalanche.json';
import baseTokensJSON from './base.json';
import * as common from '@protocolink/common';
import gnosisTokensJSON from './gnosis.json';
import mainnetTokensJSON from './mainnet.json';
import metisTokensJSON from './metis.json';
import optimismTokensJSON from './optimism.json';
import polygonTokensJSON from './polygon.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);

type PolygonTokenSymbols = keyof typeof polygonTokensJSON;

export const polygonTokens = common.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON);

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;

export const arbitrumTokens = common.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON);

type avalancheTokenSymbols = keyof typeof avalancheTokensJSON;

export const avalancheTokens = common.toTokenMap<avalancheTokenSymbols>(avalancheTokensJSON);

type metisTokenSymbols = keyof typeof metisTokensJSON;

export const metisTokens = common.toTokenMap<metisTokenSymbols>(metisTokensJSON);

type OptimismTokenSymbols = keyof typeof optimismTokensJSON;

export const optimismTokens = common.toTokenMap<OptimismTokenSymbols>(optimismTokensJSON);

type baseTokenSymbols = keyof typeof baseTokensJSON;

export const baseTokens = common.toTokenMap<baseTokenSymbols>(baseTokensJSON);

type GnosisTokenSymbols = keyof typeof gnosisTokensJSON;

export const gnosisTokens = common.toTokenMap<GnosisTokenSymbols>(gnosisTokensJSON);
