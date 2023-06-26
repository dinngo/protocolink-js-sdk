import { Declasifying, Logic } from 'src/types';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SupplyParams = Declasifying<logics.aavev3.SupplyLogicParams>;

export type SupplyFields = Declasifying<logics.aavev3.SupplyLogicFields>;

export type SupplyLogic = Logic<SupplyFields>;

export async function getSupplyTokenList(chainId: number): Promise<logics.aavev3.SupplyLogicTokenList> {
  return getProtocolTokenList(chainId, logics.aavev3.SupplyLogic.rid);
}

export async function getSupplyQuotation(
  chainId: number,
  params: SupplyParams
): Promise<logics.aavev3.SupplyLogicFields> {
  return quote(chainId, logics.aavev3.SupplyLogic.rid, params);
}

export function newSupplyLogic(fields: SupplyFields): SupplyLogic {
  return { rid: logics.aavev3.SupplyLogic.rid, fields };
}
