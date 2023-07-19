import { Token, TokenObject, TokenTypes, isTokenTypes } from './token';
import {
  TokenAmount,
  TokenAmountObject,
  TokenAmountTypes,
  TokenAmounts,
  TokenAmountsTypes,
  isTokenAmountTypes,
  isTokenAmountsTypes,
} from './token-amount';

export type Classifying<T> = T extends TokenAmountsTypes
  ? TokenAmounts
  : T extends TokenAmountTypes
  ? TokenAmount
  : T extends TokenTypes
  ? Token
  : T extends Array<infer U>
  ? U extends undefined
    ? any[]
    : Classifying<U>[]
  : T extends object
  ? {
      [K in keyof T]: Classifying<T[K]>;
    }
  : T;

export type Declasifying<T> = T extends TokenAmounts
  ? TokenAmountObject[]
  : T extends TokenAmount
  ? TokenAmountObject
  : T extends Token
  ? TokenObject
  : T extends Array<infer U>
  ? U extends undefined
    ? any[]
    : Declasifying<U>[]
  : T extends object
  ? {
      [K in keyof T]: Declasifying<T[K]>;
    }
  : T;

export function classifying<T extends Record<string, any> | any[] = any>(fields: T): Classifying<T> {
  let transformed: any;
  if (isTokenAmountsTypes(fields)) {
    transformed = TokenAmounts.from(fields);
  } else if (isTokenAmountTypes(fields)) {
    transformed = TokenAmount.from(fields);
  } else if (isTokenTypes(fields)) {
    transformed = Token.from(fields);
  } else if (Array.isArray(fields)) {
    transformed = fields.map((item) => classifying(item));
  } else if (typeof fields === 'object') {
    transformed = Object.keys(fields).reduce((accumulator, key) => {
      accumulator[key] = classifying(fields[key]);
      return accumulator;
    }, {} as Record<string, any>);
  } else {
    transformed = fields;
  }

  return transformed;
}
