import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type WithdrawParams = common.Declasifying<logics.radiantv2.WithdrawLogicParams>;

export type WithdrawFields = common.Declasifying<logics.radiantv2.WithdrawLogicFields>;

export type WithdrawLogic = Logic<WithdrawFields>;

export async function getWithdrawTokenList(chainId: number): Promise<logics.radiantv2.WithdrawLogicTokenList> {
  return getProtocolTokenList(chainId, logics.radiantv2.WithdrawLogic.rid);
}

export async function getWithdrawQuotation(
  chainId: number,
  params: WithdrawParams
): Promise<logics.radiantv2.WithdrawLogicFields> {
  return quote(chainId, logics.radiantv2.WithdrawLogic.rid, params);
}

export function newWithdrawLogic(fields: WithdrawFields): WithdrawLogic {
  return { rid: logics.radiantv2.WithdrawLogic.rid, fields };
}
