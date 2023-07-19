import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type WithdrawParams = common.Declasifying<logics.aavev3.WithdrawLogicParams>;

export type WithdrawFields = common.Declasifying<logics.aavev3.WithdrawLogicFields>;

export type WithdrawLogic = Logic<WithdrawFields>;

export async function getWithdrawTokenList(chainId: number): Promise<logics.aavev3.WithdrawLogicTokenList> {
  return getProtocolTokenList(chainId, logics.aavev3.WithdrawLogic.rid);
}

export async function getWithdrawQuotation(
  chainId: number,
  params: WithdrawParams
): Promise<logics.aavev3.WithdrawLogicFields> {
  return quote(chainId, logics.aavev3.WithdrawLogic.rid, params);
}

export function newWithdrawLogic(fields: WithdrawFields): WithdrawLogic {
  return { rid: logics.aavev3.WithdrawLogic.rid, fields };
}
