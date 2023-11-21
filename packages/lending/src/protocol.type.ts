import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import * as logics from '@protocolink/logics';

export interface Market {
  id: string;
  chainId: number;
}
export declare enum InterestRateMode {
  none = 0,
  stable = 1,
  variable = 2,
}
export const defaultInterestRateMode = 2;
export const defaultSlippage = 100;

export type Operation =
  | 'deposit'
  | 'withdraw'
  | 'borrow'
  | 'repay'
  | 'claim_rewards'
  | 'collateral_swap'
  | 'debt_swap'
  | 'leverage'
  | 'deleverage';

export interface AssetInfo {
  token: common.Token;
  price: string;
  formattedPrice: string;
  balance: string;
  formattedBalance: string;
  apy: string;
  formattedAPY: string;
}

export interface SupplyObject {
  token: common.Token;
  price: string;
  balance: string;
  apy: string;
  usageAsCollateralEnabled: boolean;
  ltv: string;
  liquidationThreshold: string;
  isNotCollateral?: boolean;
}

export interface BorrowObject {
  token: common.Token;
  price: string;
  balances: string[];
  apys: string[];
}

export interface TokenInField {
  marketId: string;
  input: common.TokenAmountObject;
}

export interface TokenOutField {
  marketId: string;
  output: common.TokenAmountObject;
}

export type RepayField = TokenInField & { account: string };

export interface Logic<TFields = any> {
  rid: string;
  fields: TFields;
}

export type SupplyParams = core.TokenInFields<{ marketId: string }>;
export type SupplyLogic = Logic<common.Declasifying<core.TokenInFields<{ output?: common.TokenAmount }>>>;

export type WithdrawParams = core.TokenOutFields<{ marketId: string }>;
export type WithdrawLogic = Logic<common.Declasifying<core.TokenOutFields<{ input?: common.TokenAmount }>>>;

export type BorrowParams = common.Declasifying<
  core.TokenOutFields<{
    interestRateMode: InterestRateMode;
  }>
>;
export type BorrowLogic = Logic<BorrowParams>;

export type RepayParams = core.TokenInFields<{
  marketId: string;
  borrower: string;
  interestRateMode?: InterestRateMode;
}>;
export type RepayLogic = Logic<
  common.Declasifying<
    core.TokenInFields<{
      marketId?: string;
      borrower: string;
      interestRateMode?: InterestRateMode;
    }>
  >
>;
