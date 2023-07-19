import { PermitBatchData, PermitSingleData } from '@uniswap/permit2-sdk';
import { TokensOutFields } from '@protocolink/core';
import * as common from '@protocolink/common';

export interface Logic<TFields = any> {
  rid: string;
  fields: TFields;
}

export interface RouterData {
  chainId: number;
  account: string;
  logics: Logic[];
  permitData?: PermitSingleData | PermitBatchData;
  permitSig?: string;
  referralCode?: number;
}

export interface RouterDataEstimateResult {
  funds: common.TokenAmounts;
  balances: common.TokenAmounts;
  approvals: common.TransactionRequest[];
  permitData?: PermitSingleData | PermitBatchData;
}

export type FlashLoanLogicFields = TokensOutFields<{ id: string; isLoan: boolean }>;

export type FlashLoanFields = common.Declasifying<FlashLoanLogicFields>;

export type FlashLoanLogic = Logic<FlashLoanFields>;
