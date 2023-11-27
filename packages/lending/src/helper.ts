// TODO: all helper, and maybe move to test-helpers
import { arbitrumTokens, avalancheTokens, mainnetTokens, metisTokens, optimismTokens, polygonTokens } from './tokens';
import * as common from '@protocolink/common';

const nativeTokenMap: Record<number, common.Token> = {
  [common.ChainId.mainnet]: mainnetTokens.ETH,
  [common.ChainId.polygon]: polygonTokens.MATIC,
  [common.ChainId.arbitrum]: arbitrumTokens.ETH,
  [common.ChainId.optimism]: optimismTokens.ETH,
  [common.ChainId.avalanche]: avalancheTokens.AVAX,
  [common.ChainId.metis]: metisTokens.METIS,
};

const wrappedNativeTokenMap: Record<number, common.Token> = {
  [common.ChainId.mainnet]: mainnetTokens.WETH,
  [common.ChainId.polygon]: polygonTokens.WMATIC,
  [common.ChainId.arbitrum]: arbitrumTokens.WETH,
  [common.ChainId.optimism]: optimismTokens.WETH,
  [common.ChainId.avalanche]: avalancheTokens.WAVAX,
  [common.ChainId.metis]: metisTokens['METIS(ERC20)'],
};

export function isSameToken(tokenA: common.Token, tokenB: common.Token): boolean {
  return tokenA.address.toLowerCase() === tokenB.address.toLowerCase();
}

export function getNativeToken(chainId: number): common.Token {
  return nativeTokenMap[chainId];
}

export function isWrappedNativeToken(chainId: number, token: common.Token): boolean {
  return isSameToken(token, getWrappedNativeToken(chainId));
}

export function getWrappedNativeToken(chainId: number): common.Token {
  return wrappedNativeTokenMap[chainId];
}

export function isNativeToken(chainId: number, token: common.Token): boolean {
  return isSameToken(token, getNativeToken(chainId));
}

export function wrapToken(chainId: number, token: common.Token) {
  return isNativeToken(chainId, token) ? getWrappedNativeToken(chainId) : token;
}

export function unwrapToken(chainId: number, token: common.Token) {
  return isWrappedNativeToken(chainId, token) ? getNativeToken(chainId) : token;
}
