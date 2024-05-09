import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type WithdrawParams = common.Declasifying<logics.sonne.WithdrawLogicParams>;

export type WithdrawFields = common.Declasifying<logics.sonne.WithdrawLogicFields>;

export type WithdrawLogic = Logic<WithdrawFields>;

export async function getWithdrawTokenList(chainId: number): Promise<logics.sonne.WithdrawLogicTokenList> {
  return getProtocolTokenList(chainId, logics.sonne.WithdrawLogic.rid);
}

export async function getWithdrawQuotation(
  chainId: number,
  params: WithdrawParams
): Promise<logics.sonne.WithdrawLogicFields> {
  return quote(chainId, logics.sonne.WithdrawLogic.rid, params);
}

export function newWithdrawLogic(fields: WithdrawFields): WithdrawLogic {
  return { rid: logics.sonne.WithdrawLogic.rid, fields };
}
