import * as common from '@protocolink/common';
import mainnetTokensJSON from './data/mainnet.json';
import polygonTokensJSON from './data/polygon.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;
type PolygonTokenSymbols = keyof typeof polygonTokensJSON;

export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);
export const polygonTokens = common.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON);
