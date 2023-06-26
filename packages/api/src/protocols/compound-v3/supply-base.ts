import { Declasifying, Logic } from 'src/types';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SupplyBaseParams = Declasifying<logics.compoundv3.SupplyBaseLogicParams>;

export type SupplyBaseFields = Declasifying<logics.compoundv3.SupplyBaseLogicFields>;

export type SupplyBaseLogic = Logic<SupplyBaseFields>;

export async function getSupplyBaseTokenList(chainId: number): Promise<logics.compoundv3.SupplyBaseLogicTokenList> {
  return getProtocolTokenList(chainId, logics.compoundv3.SupplyBaseLogic.rid);
}

export async function getSupplyBaseQuotation(
  chainId: number,
  params: SupplyBaseParams
): Promise<logics.compoundv3.SupplyBaseLogicFields> {
  return quote(chainId, logics.compoundv3.SupplyBaseLogic.rid, params);
}

export function newSupplyBaseLogic(fields: SupplyBaseFields): SupplyBaseLogic {
  return { rid: logics.compoundv3.SupplyBaseLogic.rid, fields };
}
