import { arbitrumTokens, mainnetTokens, polygonTokens } from '@protocolink/test-helpers';
// TODO: all helper, and maybe move to test-helpers
import * as common from '@protocolink/common';

const nativeTokenMap: Record<number, common.Token> = {
  [common.ChainId.mainnet]: mainnetTokens.ETH,
  [common.ChainId.polygon]: polygonTokens.MATIC,
  [common.ChainId.arbitrum]: arbitrumTokens.ETH,
};

const wrappedNativeTokenMap: Record<number, common.Token> = {
  [common.ChainId.mainnet]: mainnetTokens.WETH,
  [common.ChainId.polygon]: polygonTokens.WMATIC,
  [common.ChainId.arbitrum]: arbitrumTokens.WETH,
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
