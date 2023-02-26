import { Token, TokenObject, TokenOrAddress, isTokenObject, isTokenTypes } from './token';
import { TokenAmount, TokenAmountObject } from './token-amount';
import { Web3Toolkit } from '../web3-toolkit';
import { getNetwork } from '../networks';
import { providers } from 'ethers';
import sortBy from 'lodash/sortBy';

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

export async function tokenOrAddressToToken(
  chainId: number,
  tokenOrAddress: TokenOrAddress,
  provider?: providers.Provider
) {
  let token: Token;
  if (typeof tokenOrAddress === 'string') {
    const web3Toolkit = new Web3Toolkit(chainId, provider);
    token = await web3Toolkit.getToken(tokenOrAddress);
  } else if (isTokenObject(tokenOrAddress)) {
    token = Token.from(tokenOrAddress);
  } else {
    token = tokenOrAddress;
  }

  return token;
}
