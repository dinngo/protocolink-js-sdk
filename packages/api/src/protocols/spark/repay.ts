import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type RepayParams = common.Declasifying<logics.spark.RepayLogicParams>;

export type RepayFields = common.Declasifying<logics.spark.RepayLogicFields>;

export type RepayLogic = Logic<RepayFields>;

export async function getRepayTokenList(chainId: number): Promise<logics.spark.RepayLogicTokenList> {
  return getProtocolTokenList(chainId, logics.spark.RepayLogic.rid);
}

export async function getRepayQuotation(chainId: number, params: RepayParams): Promise<logics.spark.RepayLogicFields> {
  return quote(chainId, logics.spark.RepayLogic.rid, params);
}

export function newRepayLogic(fields: RepayFields): RepayLogic {
  return { rid: logics.spark.RepayLogic.rid, fields };
}
