import { Portfolio } from './protocol.portfolio';
import * as apisdk from '@protocolink/api';
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
  estimateResult: apisdk.RouterDataEstimateResult;
  buildRouterTransactionRequest: (
    args?: Omit<apisdk.RouterData, 'chainId' | 'account' | 'logics'>,
    apiKey?: string
  ) => Promise<common.TransactionRequest>;
  logics: apisdk.Logic[];
};

export type BaseParams = {
  srcToken: common.Token;
  srcAmount: string;
  destToken: common.Token;
};
