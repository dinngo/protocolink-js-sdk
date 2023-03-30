import { Token, TokenObject, isTokenTypes } from './token';
import { TokenAmount, TokenAmountObject } from './token-amount';
import { getNetwork } from '../networks';
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
