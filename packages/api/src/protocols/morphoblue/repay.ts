import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type RepayParams = common.Declasifying<logics.morphoblue.RepayLogicParams>;

export type RepayFields = common.Declasifying<logics.morphoblue.RepayLogicFields>;

export type RepayLogic = Logic<RepayFields>;

export async function getRepayTokenList(chainId: number): Promise<logics.morphoblue.RepayLogicTokenList> {
  return getProtocolTokenList(chainId, logics.morphoblue.RepayLogic.rid);
}

export async function getRepayQuotation(
  chainId: number,
  params: RepayParams
): Promise<logics.morphoblue.RepayLogicFields> {
  return quote(chainId, logics.morphoblue.RepayLogic.rid, params);
}

export function newRepayLogic(fields: RepayFields): RepayLogic {
  return { rid: logics.morphoblue.RepayLogic.rid, fields };
}
