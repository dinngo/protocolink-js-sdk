import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList } from 'src/api';
import * as logics from '@protocolink/logics';

export type SupplyCollateralFields = common.Declasifying<logics.morphoblue.SupplyCollateralLogicFields>;

export type SupplyCollateralLogic = Logic<SupplyCollateralFields>;

export async function getSupplyCollateralTokenList(
  chainId: number
): Promise<logics.morphoblue.SupplyCollateralLogicTokenList> {
  return getProtocolTokenList(chainId, logics.morphoblue.SupplyCollateralLogic.rid);
}

export function newSupplyCollateralLogic(fields: SupplyCollateralFields): SupplyCollateralLogic {
  return { rid: logics.morphoblue.SupplyCollateralLogic.rid, fields };
}
