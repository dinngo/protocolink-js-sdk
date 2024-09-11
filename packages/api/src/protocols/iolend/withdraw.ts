import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type WithdrawParams = common.Declasifying<logics.iolend.WithdrawLogicParams>;

export type WithdrawFields = common.Declasifying<logics.iolend.WithdrawLogicFields>;

export type WithdrawLogic = Logic<WithdrawFields>;

export async function getWithdrawTokenList(chainId: number): Promise<logics.iolend.WithdrawLogicTokenList> {
  return getProtocolTokenList(chainId, logics.iolend.WithdrawLogic.rid);
}

export async function getWithdrawQuotation(
  chainId: number,
  params: WithdrawParams
): Promise<logics.iolend.WithdrawLogicFields> {
  return quote(chainId, logics.iolend.WithdrawLogic.rid, params);
}

export function newWithdrawLogic(fields: WithdrawFields): WithdrawLogic {
  return { rid: logics.iolend.WithdrawLogic.rid, fields };
}
