import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList } from 'src/api';
import * as logics from '@protocolink/logics';

export type WithdrawCollateralFields = common.Declasifying<logics.morphoblue.WithdrawCollateralLogicFields>;

export type WithdrawCollateralLogic = Logic<WithdrawCollateralFields>;

export async function getWithdrawCollateralTokenList(
  chainId: number
): Promise<logics.morphoblue.WithdrawCollateralLogicTokenList> {
  return getProtocolTokenList(chainId, logics.morphoblue.WithdrawCollateralLogic.rid);
}

export function newWithdrawCollateralLogic(fields: WithdrawCollateralFields): WithdrawCollateralLogic {
  return { rid: logics.morphoblue.WithdrawCollateralLogic.rid, fields };
}
