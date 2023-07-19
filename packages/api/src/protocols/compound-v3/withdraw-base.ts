import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type WithdrawBaseParams = common.Declasifying<logics.compoundv3.WithdrawBaseLogicParams>;

export type WithdrawBaseFields = common.Declasifying<logics.compoundv3.WithdrawBaseLogicFields>;

export type WithdrawBaseLogic = Logic<WithdrawBaseFields>;

export async function getWithdrawBaseTokenList(chainId: number): Promise<logics.compoundv3.WithdrawBaseLogicTokenList> {
  return getProtocolTokenList(chainId, logics.compoundv3.WithdrawBaseLogic.rid);
}

export async function getWithdrawBaseQuotation(
  chainId: number,
  params: WithdrawBaseParams
): Promise<logics.compoundv3.WithdrawBaseLogicFields> {
  return quote(chainId, logics.compoundv3.WithdrawBaseLogic.rid, params);
}

export function newWithdrawBaseLogic(fields: WithdrawBaseFields): WithdrawBaseLogic {
  return { rid: logics.compoundv3.WithdrawBaseLogic.rid, fields };
}
