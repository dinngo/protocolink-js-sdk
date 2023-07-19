import { BigNumber, BigNumberish } from 'ethers';
import BigNumberJS from 'bignumber.js';
import { Token, TokenOrAddress, TokenTypes, isToken, isTokenTypes } from './token';
import invariant from 'tiny-invariant';
import orderBy from 'lodash/orderBy';
import { toBigUnit, toSmallUnit } from '../utils';

export interface TokenAmountObject {
  token: TokenTypes;
  amount: string;
}

export type TokenAmountPair = [TokenTypes, string];

export class TokenAmount {
  readonly token: Token;
  amount: string;

  constructor(token: TokenTypes, amount?: string);
  constructor(tokenAmount: TokenAmount | TokenAmountObject | TokenAmountPair);
  constructor(arg0: any, arg1?: any) {
    if (isTokenTypes(arg0)) {
      this.token = Token.from(arg0);
      this.amount = TokenAmount.precise(arg1 ?? '0', this.token.decimals);
    } else if (isTokenAmount(arg0)) {
      this.token = arg0.token;
      this.amount = arg0.amount;
    } else if (isTokenAmountObject(arg0)) {
      this.token = Token.from(arg0.token);
      this.amount = TokenAmount.precise(arg0.amount ?? '0', this.token.decimals);
    } else {
      this.token = isToken(arg0[0]) ? arg0[0] : Token.from(arg0[0]);
      this.amount = TokenAmount.precise(arg0[1] ?? '0', this.token.decimals);
    }
  }

  static from(tokenAmount: TokenAmountTypes) {
    return isTokenAmount(tokenAmount) ? tokenAmount : new TokenAmount(tokenAmount);
  }

  static precise(amount: string, decimals: number) {
    return BigNumberJS(amount).decimalPlaces(decimals, BigNumberJS.ROUND_DOWN).toString();
  }

  get amountWei() {
    return toSmallUnit(this.amount, this.token.decimals);
  }

  precise(amount: string): string;
  precise(tokenAmount: TokenAmount): string;
  precise(arg0: any) {
    let amount: string;
    if (isTokenAmount(arg0)) {
      invariant(arg0.token.is(this.token), "different tokens can't be clone");
      amount = arg0.amount;
    } else {
      amount = TokenAmount.precise(arg0, this.token.decimals);
    }
    return amount;
  }

  set(amount: string): TokenAmount;
  set(tokenAmount: TokenAmount): TokenAmount;
  set(arg0: any) {
    this.amount = this.precise(arg0);
    return this;
  }
  setWei(amountWei: BigNumberish) {
    this.amount = toBigUnit(amountWei, this.token.decimals);
    return this;
  }

  add(amount: string): TokenAmount;
  add(tokenAmount: TokenAmount): TokenAmount;
  add(arg0: any) {
    this.amount = BigNumberJS(this.amount).plus(this.precise(arg0)).toString();
    return this;
  }
  addWei(amountWei: BigNumberish) {
    this.amount = BigNumberJS(this.amount).plus(toBigUnit(amountWei, this.token.decimals)).toString();
    return this;
  }

  sub(amount: string): TokenAmount;
  sub(tokenAmount: TokenAmount): TokenAmount;
  sub(arg0: any) {
    this.amount = BigNumberJS(this.amount).minus(this.precise(arg0)).toString();
    return this;
  }
  subWei(amountWei: BigNumberish) {
    this.amount = BigNumberJS(this.amount).minus(toBigUnit(amountWei, this.token.decimals)).toString();
    return this;
  }

  get isZero() {
    return BigNumberJS(this.amount).isZero();
  }

  eq(tokenAmount: TokenAmount) {
    return this.amountWei.eq(tokenAmount.amountWei);
  }

  gt(tokenAmount: TokenAmount) {
    return this.amountWei.gt(tokenAmount.amountWei);
  }

  gte(tokenAmount: TokenAmount) {
    return this.amountWei.gte(tokenAmount.amountWei);
  }

  lt(tokenAmount: TokenAmount) {
    return this.amountWei.lt(tokenAmount.amountWei);
  }

  lte(tokenAmount: TokenAmount) {
    return this.amountWei.lte(tokenAmount.amountWei);
  }

  toObject(): TokenAmountObject {
    return { token: this.token.toObject(), amount: this.amount };
  }

  toValues(): [string, BigNumber] {
    return [this.token.address, this.amountWei];
  }

  clone() {
    return new TokenAmount(this.token, this.amount);
  }
}

export type TokenAmountTypes = TokenAmountObject | TokenAmountPair | TokenAmount;

export function isTokenAmountObject(v: any): v is TokenAmountObject {
  return typeof v === 'object' && isTokenTypes(v.token) && typeof v.amount === 'string' && !isTokenAmount(v);
}

export function isTokenAmountPair(v: any): v is TokenAmountPair {
  return Array.isArray(v) && isTokenTypes(v[0]) && typeof v[1] === 'string';
}

export function isTokenAmount(v: any): v is TokenAmount {
  return v instanceof TokenAmount;
}

export function isTokenAmountTypes(v: any): v is TokenAmountTypes {
  return isTokenAmountObject(v) || isTokenAmountPair(v) || isTokenAmount(v);
}

export class TokenAmounts {
  tokenAmountMap: Record<string, TokenAmount> = {};

  constructor(tokenAmounts: TokenAmountTypes[]);
  constructor(...tokenAmounts: TokenAmountTypes[]);
  constructor(arg0: any, ...otherArgs: any[]) {
    if (arg0) {
      if (isTokenAmountTypes(arg0)) {
        this.add(arg0);
      } else {
        for (const tokenAmount of arg0) {
          this.add(tokenAmount);
        }
      }
    }
    for (const tokenAmount of otherArgs) {
      this.add(tokenAmount);
    }
  }

  static from(tokenAmounts: TokenAmountsTypes) {
    return isTokenAmounts(tokenAmounts) ? tokenAmounts : new TokenAmounts(tokenAmounts);
  }

  get length() {
    return Object.keys(this.tokenAmountMap).length;
  }

  at(index: number) {
    return this.toArray()[index];
  }

  get(tokenOrAddress: TokenOrAddress) {
    return this.tokenAmountMap[Token.getAddress(tokenOrAddress)];
  }

  set(token: TokenTypes, amount: string): TokenAmounts;
  set(tokenAmount: TokenAmountTypes): TokenAmounts;
  set(arg0: any, arg1?: any) {
    const tokenAmount = new TokenAmount(arg0, arg1);
    this.tokenAmountMap[tokenAmount.token.address] = tokenAmount;
    return this;
  }

  has(tokenOrAddress: TokenOrAddress): boolean {
    return !!this.get(tokenOrAddress);
  }

  add(token: TokenTypes, amount: string): TokenAmounts;
  add(tokenAmount: TokenAmountTypes): TokenAmounts;
  add(arg0: any, arg1?: any) {
    const tokenAmount = new TokenAmount(arg0, arg1);
    if (this.has(tokenAmount.token)) {
      this.tokenAmountMap[tokenAmount.token.address].add(tokenAmount);
    } else {
      this.set(tokenAmount);
    }
    return this;
  }

  sub(token: TokenTypes, amount: string): TokenAmounts;
  sub(tokenAmount: TokenAmountTypes): TokenAmounts;
  sub(arg0: any, arg1?: any) {
    const tokenAmount = new TokenAmount(arg0, arg1);
    if (this.has(tokenAmount.token)) {
      this.tokenAmountMap[tokenAmount.token.address].sub(tokenAmount);
    }
    return this;
  }

  toArray() {
    return Object.keys(this.tokenAmountMap).map((tokenAddress) => this.tokenAmountMap[tokenAddress]);
  }

  toObject() {
    return orderBy(
      Object.keys(this.tokenAmountMap).map((tokenAddress) => this.tokenAmountMap[tokenAddress].toObject()),
      'token.symbol'
    );
  }

  toJSON() {
    return this.toObject();
  }

  toValues() {
    return Object.keys(this.tokenAmountMap).reduce(
      (accumulator, tokenAddress) => {
        accumulator[0].push(tokenAddress);
        accumulator[1].push(this.tokenAmountMap[tokenAddress].amountWei);

        return accumulator;
      },
      [[], []] as [string[], BigNumber[]]
    );
  }

  compact() {
    const tokenAmounts = new TokenAmounts();
    Object.keys(this.tokenAmountMap).forEach((tokenAddress) => {
      if (!this.tokenAmountMap[tokenAddress].isZero) {
        tokenAmounts.add(this.tokenAmountMap[tokenAddress]);
      }
    });
    return tokenAmounts;
  }

  get isEmpty() {
    return this.length === 0;
  }

  get native() {
    let nativeTokenAmount: TokenAmount | undefined;
    for (const tokenAddress of Object.keys(this.tokenAmountMap)) {
      const tokenAmount = this.tokenAmountMap[tokenAddress];
      if (tokenAmount.token.isNative) {
        nativeTokenAmount = tokenAmount;
        break;
      }
    }
    return nativeTokenAmount;
  }

  get erc20() {
    return Object.keys(this.tokenAmountMap).reduce((accumulator, tokenAddress) => {
      const tokenAmount = this.tokenAmountMap[tokenAddress];
      if (!tokenAmount.token.isNative) accumulator.set(tokenAmount);
      return accumulator;
    }, new TokenAmounts());
  }

  get tokens() {
    return Object.keys(this.tokenAmountMap).reduce((accumulator, tokenAddress) => {
      accumulator.push(this.tokenAmountMap[tokenAddress].token);
      return accumulator;
    }, [] as Token[]);
  }

  forEach(callbackfn: (value: TokenAmount, index: number, array: TokenAmounts) => void): void {
    Object.keys(this.tokenAmountMap).map((tokenAddress, index) =>
      callbackfn(this.tokenAmountMap[tokenAddress], index, this)
    );
  }

  map<U>(callbackfn: (value: TokenAmount, index: number, array: TokenAmounts) => U): U[] {
    return Object.keys(this.tokenAmountMap).map((tokenAddress, index) =>
      callbackfn(this.tokenAmountMap[tokenAddress], index, this)
    );
  }

  merge(sources: TokenAmounts | TokenAmounts[]) {
    let tokenAmountsArray: TokenAmounts[] = [this];
    if (Array.isArray(sources)) {
      tokenAmountsArray = tokenAmountsArray.concat(sources);
    } else {
      tokenAmountsArray.push(sources);
    }
    const newTokenAmounts = new TokenAmounts();
    for (const tokenAmounts of tokenAmountsArray) {
      Object.keys(tokenAmounts.tokenAmountMap).forEach((tokenAddress) => {
        newTokenAmounts.add(tokenAmounts.tokenAmountMap[tokenAddress]);
      });
    }

    return newTokenAmounts;
  }
}

export type TokenAmountsTypes = TokenAmountObject[] | TokenAmounts;

export function isTokenAmountObjects(v: any): v is TokenAmountObject[] {
  return Array.isArray(v) && isTokenAmountObject(v[0]);
}

export function isTokenAmounts(v: any): v is TokenAmounts {
  return v instanceof TokenAmounts;
}

export function isTokenAmountsTypes(v: any): v is TokenAmountsTypes {
  return isTokenAmountObjects(v) || isTokenAmounts(v);
}
