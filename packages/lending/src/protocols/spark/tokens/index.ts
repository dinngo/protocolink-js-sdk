import * as common from '@protocolink/common';
import gnosisTokensJSON from './data/gnosis.json';
import mainnetTokensJSON from './data/mainnet.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;
type GnosisTokenSymbols = keyof typeof gnosisTokensJSON;

export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);
export const gnosisTokens = common.toTokenMap<GnosisTokenSymbols>(gnosisTokensJSON);
