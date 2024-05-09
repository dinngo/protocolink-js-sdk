import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SupplyParams = common.Declasifying<logics.sonne.SupplyLogicParams>;

export type SupplyFields = common.Declasifying<logics.sonne.SupplyLogicFields>;

export type SupplyLogic = Logic<SupplyFields>;

export async function getSupplyTokenList(chainId: number): Promise<logics.sonne.SupplyLogicTokenList> {
  return getProtocolTokenList(chainId, logics.sonne.SupplyLogic.rid);
}

export async function getSupplyQuotation(
  chainId: number,
  params: SupplyParams
): Promise<logics.sonne.SupplyLogicFields> {
  return quote(chainId, logics.sonne.SupplyLogic.rid, params);
}

export function newSupplyLogic(fields: SupplyFields): SupplyLogic {
  return { rid: logics.sonne.SupplyLogic.rid, fields };
}
