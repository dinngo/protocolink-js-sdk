import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type RepayParams = common.Declasifying<logics.iolend.RepayLogicParams>;

export type RepayFields = common.Declasifying<logics.iolend.RepayLogicFields>;

export type RepayLogic = Logic<RepayFields>;

export async function getRepayTokenList(chainId: number): Promise<logics.iolend.RepayLogicTokenList> {
  return getProtocolTokenList(chainId, logics.iolend.RepayLogic.rid);
}

export async function getRepayQuotation(chainId: number, params: RepayParams): Promise<logics.iolend.RepayLogicFields> {
  return quote(chainId, logics.iolend.RepayLogic.rid, params);
}

export function newRepayLogic(fields: RepayFields): RepayLogic {
  return { rid: logics.iolend.RepayLogic.rid, fields };
}
