import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type WithdrawParams = common.Declasifying<logics.spark.WithdrawLogicParams>;

export type WithdrawFields = common.Declasifying<logics.spark.WithdrawLogicFields>;

export type WithdrawLogic = Logic<WithdrawFields>;

export async function getWithdrawTokenList(chainId: number): Promise<logics.spark.WithdrawLogicTokenList> {
  return getProtocolTokenList(chainId, logics.spark.WithdrawLogic.rid);
}

export async function getWithdrawQuotation(
  chainId: number,
  params: WithdrawParams
): Promise<logics.spark.WithdrawLogicFields> {
  return quote(chainId, logics.spark.WithdrawLogic.rid, params);
}

export function newWithdrawLogic(fields: WithdrawFields): WithdrawLogic {
  return { rid: logics.spark.WithdrawLogic.rid, fields };
}
