import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import * as logics from '@protocolink/logics';

export interface Market {
  id: string;
  chainId: number;
}

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
export type SupplyFields = common.Declasifying<core.TokenToTokenExactInFields>;
export type SupplyLogic = Logic<SupplyFields>;

export type WithdrawFields = common.Declasifying<core.TokenToTokenExactInFields>;
export type WithdrawLogic = Logic<WithdrawFields>;

export type BorrowFields = common.Declasifying<core.TokenOutFields>;
export type BorrowLogic = Logic<BorrowFields>;

export type RepayFields = common.Declasifying<core.RepayFields>;
export type RepayLogic = Logic<RepayFields>;

// export type CollateralSwapFields = common.Declasifying<core.TokenToTokenExactInParams>;
// export type CollateralSwapLogics = Logic<CollateralSwapFields>;
export type CollateralSwapFields = {
  fields: common.Declasifying<core.TokenToTokenExactInFields>;
  logics: any[];
};

export type SupplyParams = common.Declasifying<logics.aavev3.SupplyLogicParams>;
export type WithdrawParams = common.Declasifying<logics.aavev3.WithdrawLogicParams>;
export type RepayParams = common.Declasifying<logics.aavev3.RepayLogicParams>;
