import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type RepayParams = common.Declasifying<logics.aavev2.RepayLogicParams>;

export type RepayFields = common.Declasifying<logics.aavev2.RepayLogicFields>;

export type RepayLogic = Logic<RepayFields>;

export async function getRepayTokenList(chainId: number): Promise<logics.aavev2.RepayLogicTokenList> {
  return getProtocolTokenList(chainId, logics.aavev2.RepayLogic.rid);
}

export async function getRepayQuotation(chainId: number, params: RepayParams): Promise<logics.aavev2.RepayLogicFields> {
  return quote(chainId, logics.aavev2.RepayLogic.rid, params);
}

export function newRepayLogic(fields: RepayFields): RepayLogic {
  return { rid: logics.aavev2.RepayLogic.rid, fields };
}
