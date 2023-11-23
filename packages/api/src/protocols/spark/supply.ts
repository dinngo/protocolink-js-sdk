import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SupplyParams = common.Declasifying<logics.spark.SupplyLogicParams>;

export type SupplyFields = common.Declasifying<logics.spark.SupplyLogicFields>;

export type SupplyLogic = Logic<SupplyFields>;

export async function getSupplyTokenList(chainId: number): Promise<logics.spark.SupplyLogicTokenList> {
  return getProtocolTokenList(chainId, logics.spark.SupplyLogic.rid);
}

export async function getSupplyQuotation(
  chainId: number,
  params: SupplyParams
): Promise<logics.spark.SupplyLogicFields> {
  return quote(chainId, logics.spark.SupplyLogic.rid, params);
}

export function newSupplyLogic(fields: SupplyFields): SupplyLogic {
  return { rid: logics.spark.SupplyLogic.rid, fields };
}
