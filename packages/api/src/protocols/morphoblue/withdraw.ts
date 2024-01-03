import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList } from 'src/api';
import * as logics from '@protocolink/logics';

export type WithdrawFields = common.Declasifying<logics.morphoblue.WithdrawLogicFields>;

export type WithdrawLogic = Logic<WithdrawFields>;

export async function getWithdrawTokenList(chainId: number): Promise<logics.morphoblue.WithdrawLogicTokenList> {
  return getProtocolTokenList(chainId, logics.morphoblue.WithdrawLogic.rid);
}

export function newWithdrawLogic(fields: WithdrawFields): WithdrawLogic {
  return { rid: logics.morphoblue.WithdrawLogic.rid, fields };
}
