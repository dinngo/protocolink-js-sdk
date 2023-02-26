import mainnetTokensJSON from './mainnet.json';
import { toTokenMap } from '@composable-router/common';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);
