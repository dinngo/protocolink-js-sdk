import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type RepayParams = common.Declasifying<logics.sonne.RepayLogicParams>;

export type RepayFields = common.Declasifying<logics.sonne.RepayLogicFields>;

export type RepayLogic = Logic<RepayFields>;

export async function getRepayTokenList(chainId: number): Promise<logics.sonne.RepayLogicTokenList> {
  return getProtocolTokenList(chainId, logics.sonne.RepayLogic.rid);
}

export async function getRepayQuotation(chainId: number, params: RepayParams): Promise<logics.sonne.RepayLogicFields> {
  return quote(chainId, logics.sonne.RepayLogic.rid, params);
}

export function newRepayLogic(fields: RepayFields): RepayLogic {
  return { rid: logics.sonne.RepayLogic.rid, fields };
}
