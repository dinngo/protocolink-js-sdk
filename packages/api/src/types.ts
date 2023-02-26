import { PermitBatchData } from '@uniswap/permit2-sdk';
import { TokensOutFields } from '@composable-router/core';
import * as common from '@composable-router/common';

export type ToObjectFields<T> = {
  [K in keyof T]: T[K] extends common.Token
    ? common.TokenObject
    : T[K] extends common.TokenAmount
    ? common.TokenAmountObject
    : T[K] extends common.TokenAmounts
    ? common.TokenAmountObject[]
    : T[K];
};

export type ToFields<T> = {
  [K in keyof T]: T[K] extends common.TokenObject
    ? common.Token
    : T[K] extends common.TokenAmountObject
    ? common.TokenAmount
    : T[K] extends common.TokenAmountObject[]
    ? common.TokenAmounts
    : T[K];
};

export interface LogicFormData<TFields = any> {
  rid: string;
  fields: ToObjectFields<TFields>;
}

export interface RouterFormData {
  chainId: number;
  account: string;
  slippage?: number;
  logics: LogicFormData[];
  permitData?: PermitBatchData;
  permitSig?: string;
}

export interface RouterFormDataEstimateResult {
  funds: common.TokenAmounts;
  balances: common.TokenAmounts;
  approvals: common.TransactionRequest[];
  permitData?: PermitBatchData;
}

export type FlashLoanFields = TokensOutFields<{ id: string; isLoan: boolean }>;
