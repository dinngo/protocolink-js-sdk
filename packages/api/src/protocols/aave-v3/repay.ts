import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type RepayParams = common.Declasifying<logics.aavev3.RepayLogicParams>;

export type RepayFields = common.Declasifying<logics.aavev3.RepayLogicFields>;

export type RepayLogic = Logic<RepayFields>;

export async function getRepayTokenList(chainId: number): Promise<logics.aavev3.RepayLogicTokenList> {
  return getProtocolTokenList(chainId, logics.aavev3.RepayLogic.rid);
}

export async function getRepayQuotation(chainId: number, params: RepayParams): Promise<logics.aavev3.RepayLogicFields> {
  return quote(chainId, logics.aavev3.RepayLogic.rid, params);
}

export function newRepayLogic(fields: RepayFields): RepayLogic {
  return { rid: logics.aavev3.RepayLogic.rid, fields };
}
