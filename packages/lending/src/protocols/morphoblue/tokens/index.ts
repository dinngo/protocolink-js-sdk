import * as common from '@protocolink/common';
import mainnetTokensJSON from './data/mainnet.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);
