import { Logic } from './protocol.type';
import { Portfolio } from './protocol.portfolio';
import * as api from '@protocolink/api';
import * as common from '@protocolink/common';

export type BaseFields = {
  fields: {
    srcToken: common.Token;
    srcAmount: string;
    destToken?: common.Token;
    destAmount?: string;
    portfolio?: Portfolio;
    afterPortfolio?: Portfolio;

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
