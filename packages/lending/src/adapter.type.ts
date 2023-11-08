import { Logic } from './protocol.types';
import * as common from '@protocolink/common';

type LendingInfo = Partial<
  Record<'healthRate' | 'netAPY' | 'liquidationThreshold' | 'utilization' | 'totalBorrowUSD', string>
>;

type BaseFields = {
  fields: {
    srcToken: common.Token;
    srcAmount: string;
    destToken: common.Token;
    destAmount: string;
    before: LendingInfo;
    after: LendingInfo;
  };
  logics: Logic[];
};

type BaseParams = {
  srcToken: common.Token;
  srcAmount: string;
  destToken: common.Token;
};

export type CollateralSwapFields = BaseFields;
export type CollateralSwapParams = BaseParams;

export type DebtSwapFields = BaseFields;
export type DebtSwapParams = BaseParams;

export type LeverageLongFields = {
  fields: {
    srcToken: common.Token;
    srcAmount: string;
    before: LendingInfo;
    after: LendingInfo;
  };
  logics: Logic[];
};
export type LeverageLongParams = BaseParams;

export type LeverageShortFields = {
  fields: {
    srcToken: common.Token;
    srcAmount: string;
    before: LendingInfo;
    after: LendingInfo;
  };
  logics: Logic[];
};
export type LeverageShortParams = BaseParams;

export type DeleverageFields = BaseFields;
export type DeleverageParams = BaseParams;

export type ZapSupplyFields = BaseFields;
export type ZapSupplyParams = BaseParams;

export type ZapWithdrawFields = BaseFields;
export type ZapWithdrawParams = BaseParams;

export type ZapBorrowFields = BaseFields;
export type ZapBorrowParams = BaseParams;

export type ZapRepayFields = BaseFields;
export type ZapRepayParams = BaseParams;
