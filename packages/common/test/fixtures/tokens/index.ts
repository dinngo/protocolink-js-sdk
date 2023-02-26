import mainnetTokensJSON from './mainnet.json';
import { toTokenMap } from 'src/tokens/utils';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);
