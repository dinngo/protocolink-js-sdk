import { Logic } from './protocol.type';
import * as api from '@protocolink/api';
import * as common from '@protocolink/common';

type LendingInfo = Partial<
  Record<'healthRate' | 'netAPY' | 'liquidationThreshold' | 'utilization' | 'totalBorrowUSD', string>
>;

export type BaseFields = {
  fields: {
    srcToken: common.Token;
    srcAmount: string;
    destToken?: common.Token;
    destAmount?: string;
    before: LendingInfo;
    after: LendingInfo;
  };
  estimateResult: api.RouterDataEstimateResult;
  buildRouterTransactionRequest: (
    args?: Omit<api.RouterData, 'chainId' | 'account' | 'logics'>
  ) => Promise<common.TransactionRequest>;
  logics: Logic[];
};

export type BaseParams = {
  srcToken: common.Token;
  srcAmount: string;
  destToken: common.Token;
};

export type DebtSwapFields = BaseFields;
