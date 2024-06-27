import avalancheTokensJSON from './data/avalanche.json';
import * as common from '@protocolink/common';
import mainnetTokensJSON from './data/mainnet.json';
import polygonTokensJSON from './data/polygon.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;
type PolygonTokenSymbols = keyof typeof polygonTokensJSON;
type AvalancheTokenSymbols = keyof typeof avalancheTokensJSON;

export const mainnetTokens = { ...common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON), ...common.mainnetTokens };
export const polygonTokens = { ...common.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON), ...common.polygonTokens };
export const avalancheTokens = {
  ...common.toTokenMap<AvalancheTokenSymbols>(avalancheTokensJSON),
  ...common.avalancheTokens,
};
