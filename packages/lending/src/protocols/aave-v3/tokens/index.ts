import arbitrumTokensJSON from './data/arbitrum.json';
import avalancheTokensJSON from './data/avalanche.json';
import baseTokensJSON from './data/base.json';
import * as common from '@protocolink/common';
import gnosisTokensJSON from './data/gnosis.json';
import mainnetTokensJSON from './data/mainnet.json';
import metisTokensJSON from './data/metis.json';
import optimismTokensJSON from './data/optimism.json';
import polygonTokensJSON from './data/polygon.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;
type OptimismTokenSymbols = keyof typeof optimismTokensJSON;
type GnosisTokenSymbols = keyof typeof gnosisTokensJSON;
type PolygonTokenSymbols = keyof typeof polygonTokensJSON;
type MetisTokenSymbols = keyof typeof metisTokensJSON;
type BaseTokenSymbols = keyof typeof baseTokensJSON;
type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;
type AvalancheTokenSymbols = keyof typeof avalancheTokensJSON;

export const mainnetTokens = { ...common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON), ...common.mainnetTokens };

export const optimismTokens = {
  ...common.toTokenMap<OptimismTokenSymbols>(optimismTokensJSON),
  ...common.optimismTokens,
};

export const gnosisTokens = { ...common.toTokenMap<GnosisTokenSymbols>(gnosisTokensJSON), ...common.gnosisTokens };

export const polygonTokens = { ...common.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON), ...common.polygonTokens };

export const metisTokens = { ...common.toTokenMap<MetisTokenSymbols>(metisTokensJSON), ...common.metisTokens };

export const baseTokens = { ...common.toTokenMap<BaseTokenSymbols>(baseTokensJSON), ...common.baseTokens };

export const arbitrumTokens = {
  ...common.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON),
  ...common.arbitrumTokens,
};

export const avalancheTokens = {
  ...common.toTokenMap<AvalancheTokenSymbols>(avalancheTokensJSON),
  ...common.avalancheTokens,
};
