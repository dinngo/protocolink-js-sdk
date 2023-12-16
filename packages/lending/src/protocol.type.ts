import * as common from '@protocolink/common';

export interface Market {
  id: string;
  chainId: number;
}

export const defaultInterestRateMode = 2;

export const defaultSlippage = 100;

export type Operation =
  | 'deposit'
  | 'withdraw'
  | 'borrow'
  | 'repay'
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

export interface TokenInFields {
  marketId: string;
  input: common.TokenAmount;
}

export interface TokenOutFields {
  marketId: string;
  output: common.TokenAmount;
}

export type RepayFields = TokenInFields & { account: string };
