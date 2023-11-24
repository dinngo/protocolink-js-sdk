import arbitrumTokensJSON from './arbitrum.json';
import * as common from '@protocolink/common';
import mainnetTokensJSON from './mainnet.json';
import polygonTokensJSON from './polygon.json';
import zksyncTokensJSON from './zksync.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);

type PolygonTokenSymbols = keyof typeof polygonTokensJSON;

export const polygonTokens = common.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON);

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;

export const arbitrumTokens = common.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON);

type ZkSyncTokenSymbols = keyof typeof zksyncTokensJSON;

export const zksyncTokens = common.toTokenMap<ZkSyncTokenSymbols>(zksyncTokensJSON);
