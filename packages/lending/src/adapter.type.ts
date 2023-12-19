import { Portfolio } from './protocol.portfolio';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';

export interface OperationInput {
  account: string;
  portfolio: Portfolio;
  srcToken: common.Token;
  srcAmount: string;
  destToken: common.Token;
  slippage?: number;
}

export interface OperationError {
  name: string;
  code: string;
}

export type OperationOutput = {
  destAmount: string;
  afterPortfolio: Portfolio;
  error?: OperationError;
  logics: apisdk.Logic[];
};
