import { ChainId, getNetwork } from '../networks';
import { ELASTIC_ADDRESS } from './constants';
import { Token, TokenObject, isTokenTypes } from './token';
import { TokenAmount, TokenAmountObject } from './token-amount';
import arbitrumTokensJSON from './data/arbitrum.json';
import avalancheTokensJSON from './data/avalanche.json';
import { axios } from 'src/utils/http';
import baseTokensJSON from './data/base.json';
import bnbTokensJSON from './data/bnb.json';
import gnosisTokensJSON from './data/gnosis.json';
import iotaTokensJSON from './data/iota.json';
import mainnetTokensJSON from './data/mainnet.json';
import metisTokensJSON from './data/metis.json';
import optimismTokensJSON from './data/optimism.json';
import polygonTokensJSON from './data/polygon.json';
import sortBy from 'lodash/sortBy';
import zksyncTokensJSON from './data/zksync.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;
type OptimismTokenSymbols = keyof typeof optimismTokensJSON;
type BnbTokenSymbols = keyof typeof bnbTokensJSON;
type GnosisTokenSymbols = keyof typeof gnosisTokensJSON;
type PolygonTokenSymbols = keyof typeof polygonTokensJSON;
type ZksyncTokenSymbols = keyof typeof zksyncTokensJSON;
type MetisTokenSymbols = keyof typeof metisTokensJSON;
type BaseTokenSymbols = keyof typeof baseTokensJSON;
type IotaTokenSymbols = keyof typeof iotaTokensJSON;
type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;
type AvalancheTokenSymbols = keyof typeof avalancheTokensJSON;

export const mainnetTokens = toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);
export const optimismTokens = toTokenMap<OptimismTokenSymbols>(optimismTokensJSON);
export const bnbTokens = toTokenMap<BnbTokenSymbols>(bnbTokensJSON);
export const gnosisTokens = toTokenMap<GnosisTokenSymbols>(gnosisTokensJSON);
export const polygonTokens = toTokenMap<PolygonTokenSymbols>(polygonTokensJSON);
export const zksyncTokens = toTokenMap<ZksyncTokenSymbols>(zksyncTokensJSON);
export const metisTokens = toTokenMap<MetisTokenSymbols>(metisTokensJSON);
export const baseTokens = toTokenMap<BaseTokenSymbols>(baseTokensJSON);
export const iotaTokens = toTokenMap<IotaTokenSymbols>(iotaTokensJSON);
export const arbitrumTokens = toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON);
export const avalancheTokens = toTokenMap<AvalancheTokenSymbols>(avalancheTokensJSON);

export function toTokenMap<T extends string>(tokenObjectMap: Record<string, TokenObject>): Record<T, Token> {
  return Object.keys(tokenObjectMap).reduce((accumulator, symbol) => {
    accumulator[symbol] = new Token(tokenObjectMap[symbol]);
    return accumulator;
  }, {} as Record<string, Token>);
}

export function getNativeToken(chainId: number) {
  return new Token(getNetwork(chainId).nativeToken);
}

export function getWrappedNativeToken(chainId: number) {
  return new Token(getNetwork(chainId).wrappedNativeToken);
}

export function sortByAddress<T extends Token | TokenObject | TokenAmount | TokenAmountObject>(tokenOrAmounts: T[]) {
  return sortBy<T>(tokenOrAmounts, (tokenOrAmount) => {
    const address = isTokenTypes(tokenOrAmount) ? tokenOrAmount.address : tokenOrAmount.token.address;
    return address.toLowerCase();
  });
}

function convertTokensToTokensByAddress(tokensBySymbol: Record<string, Token>): Record<string, Token> {
  return Object.fromEntries(Object.values(tokensBySymbol).map((token) => [token.address, token]));
}

// Map tokens by chain ID and address
const customTokenMap: Record<number, Record<string, Token>> = {
  [ChainId.mainnet]: convertTokensToTokensByAddress(mainnetTokens),
  [ChainId.optimism]: convertTokensToTokensByAddress(optimismTokens),
  [ChainId.bnb]: convertTokensToTokensByAddress(bnbTokens),
  [ChainId.gnosis]: convertTokensToTokensByAddress(gnosisTokens),
  [ChainId.polygon]: convertTokensToTokensByAddress(polygonTokens),
  [ChainId.zksync]: convertTokensToTokensByAddress(zksyncTokens),
  [ChainId.metis]: convertTokensToTokensByAddress(metisTokens),
  [ChainId.base]: convertTokensToTokensByAddress(baseTokens),
  [ChainId.iota]: convertTokensToTokensByAddress(iotaTokens),
  [ChainId.arbitrum]: convertTokensToTokensByAddress(arbitrumTokens),
  [ChainId.avalanche]: convertTokensToTokensByAddress(avalancheTokens),
};

// Map tokens by address
export function getCustomTokens(chainId: number) {
  return customTokenMap[chainId];
}

// Cache unified tokens by chain ID and address
const unifiedTokenMapCache: Record<number, Record<string, Token>> = {};

// Map tokens by address
export async function getUnifiedTokens(chainId: number) {
  if (unifiedTokenMapCache[chainId]) return unifiedTokenMapCache[chainId];

  const customTokenMap = getCustomTokens(chainId);

  let tokenMap: Record<string, Token> = {};

  try {
    const tokens = await getTokens(chainId);
    tokenMap = Object.fromEntries(tokens.map((token) => [token.address, token]));
  } catch (error) {
    console.error('Failed to fetch external tokens:', error);
  }

  // Merge tokens, custom tokens take precedence
  unifiedTokenMapCache[chainId] = { ...tokenMap, ...customTokenMap };

  return unifiedTokenMapCache[chainId];
}

export type TokenArray = Token[];
export type TokenPairArray = [Token, Token][];
export type TokenRecord = Record<string, Token[]>;
export type TokenPairRecord = Record<string, [Token, Token][]>;
export type TokenFormat = TokenArray | TokenPairArray | TokenRecord | TokenPairRecord;

function isTokenArray(tokens: TokenFormat): tokens is TokenArray {
  return Array.isArray(tokens) && !Array.isArray(tokens[0]) && typeof tokens[0] === 'object';
}

function isTokenPairArray(tokens: TokenFormat): tokens is TokenPairArray {
  return Array.isArray(tokens) && tokens.length > 0 && Array.isArray(tokens[0]);
}

function isTokenRecord(tokens: TokenFormat): tokens is TokenRecord {
  return (
    typeof tokens === 'object' &&
    !Array.isArray(tokens) &&
    typeof Object.values(tokens)[0][0] === 'object' &&
    'address' in Object.values(tokens)[0][0]
  );
}

function isTokenPairRecord(tokens: TokenFormat): tokens is TokenPairRecord {
  return (
    typeof tokens === 'object' &&
    !Array.isArray(tokens) &&
    Array.isArray(Object.values(tokens)[0][0]) &&
    'address' in Object.values(tokens)[0][0][0]
  );
}

//  Replaces tokens in various formats with unified tokens based on their addresses.
function replaceTokens(tokens: TokenFormat, tokenMap: Record<string, Token>): TokenFormat {
  function replaceToken(token: Token): Token {
    return tokenMap[token.address] || token;
  }

  if (isTokenArray(tokens)) return tokens.map(replaceToken);

  if (isTokenPairArray(tokens)) {
    return tokens.map(([token1, token2]) => [replaceToken(token1), replaceToken(token2)] as [Token, Token]);
  }

  if (isTokenRecord(tokens)) {
    const tokenRecord: TokenRecord = {};
    for (const key in tokens) {
      tokenRecord[key] = (tokens[key] as Token[]).map(replaceToken);
    }
    return tokenRecord;
  }

  if (isTokenPairRecord(tokens)) {
    const tokenPairRecord: TokenPairRecord = {};
    for (const key in tokens) {
      tokenPairRecord[key] = tokens[key].map(([token1, token2]) => [replaceToken(token1), replaceToken(token2)]);
    }
    return tokenPairRecord;
  }

  return tokens;
}

export function unifyTokensByCustomTokens<T extends TokenFormat>(chainId: number, tokens: T): T {
  return replaceTokens(tokens, getCustomTokens(chainId)) as T;
}

export async function unifyTokens<T extends TokenFormat>(chainId: number, tokens: T): Promise<T> {
  return replaceTokens(tokens, await getUnifiedTokens(chainId)) as T;
}

async function getTokens(chainId: number) {
  switch (chainId) {
    case ChainId.metis: {
      return await getMetisTokens();
    }
    case ChainId.iota: {
      return await getIotaTokens();
    }
    default: {
      return await get1InchTokens(chainId);
    }
  }
}

async function get1InchTokens(chainId: number) {
  const { data } = await axios.get<
    Record<string, { symbol: string; name: string; address: string; decimals: number; logoURI: string }>
  >(`https://tokens.1inch.io/v1.2/${chainId}`);

  const nativeToken = getNativeToken(chainId);
  const elasticAddress = ELASTIC_ADDRESS.toLowerCase();
  const tokens = Object.values(data).map(({ symbol, name, address, decimals, logoURI }) =>
    address === elasticAddress ? nativeToken : new Token(chainId, address, decimals, symbol, name, logoURI)
  );

  return tokens;
}

async function getMetisTokens() {
  const chainId = ChainId.metis;
  const { data } = await axios.get<{
    tokens: { address: string; name: string; symbol: string; decimals: number; logoURI: string }[];
  }>(`https://tokens.coingecko.com/metis-andromeda/all.json`);

  const tokens = [getNativeToken(chainId)];
  for (const { address, name, symbol, decimals, logoURI } of data.tokens) {
    tokens.push(new Token(chainId, address, decimals, symbol, name, logoURI));
  }

  return tokens;
}

async function getIotaTokens() {
  const chainId = ChainId.iota;
  const { data } = await axios.get<{
    tokens: { name: string; symbol: string; decimals: number; logoURI: string; address: string; chainId: number }[];
  }>(`https://raw.githubusercontent.com/MagicSea-Finance/tokenlist/main/token.default.json`);

  const tokens = [getNativeToken(chainId)];
  for (const { name, symbol, decimals, logoURI, address, chainId } of data.tokens) {
    if (chainId !== ChainId.iota) continue;
    tokens.push(new Token(chainId, address, decimals, symbol, name, logoURI));
  }

  return tokens;
}
