import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList } from 'src/api';
import * as logics from '@protocolink/logics';

export type SupplyFields = common.Declasifying<logics.morphoblue.SupplyLogicFields>;

export type SupplyLogic = Logic<SupplyFields>;

export async function getSupplyTokenList(chainId: number): Promise<logics.morphoblue.SupplyLogicTokenList> {
  return getProtocolTokenList(chainId, logics.morphoblue.SupplyLogic.rid);
}

export function newSupplyLogic(fields: SupplyFields): SupplyLogic {
  return { rid: logics.morphoblue.SupplyLogic.rid, fields };
}
