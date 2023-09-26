import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type RepayParams = common.Declasifying<logics.radiantv2.RepayLogicParams>;

export type RepayFields = common.Declasifying<logics.radiantv2.RepayLogicFields>;

export type RepayLogic = Logic<RepayFields>;

export async function getRepayTokenList(chainId: number): Promise<logics.radiantv2.RepayLogicTokenList> {
  return getProtocolTokenList(chainId, logics.radiantv2.RepayLogic.rid);
}

export async function getRepayQuotation(
  chainId: number,
  params: RepayParams
): Promise<logics.radiantv2.RepayLogicFields> {
  return quote(chainId, logics.radiantv2.RepayLogic.rid, params);
}

export function newRepayLogic(fields: RepayFields): RepayLogic {
  return { rid: logics.radiantv2.RepayLogic.rid, fields };
}
