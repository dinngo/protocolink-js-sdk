import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList } from 'src/api';
import * as logics from '@protocolink/logics';

export type BorrowFields = common.Declasifying<logics.morphoblue.BorrowLogicFields>;

export type BorrowLogic = Logic<BorrowFields>;

export async function getBorrowTokenList(chainId: number): Promise<logics.morphoblue.BorrowLogicTokenList> {
  return getProtocolTokenList(chainId, logics.morphoblue.BorrowLogic.rid);
}

export function newBorrowLogic(fields: BorrowFields): BorrowLogic {
  return { rid: logics.morphoblue.BorrowLogic.rid, fields };
}
