import { Declasifying, Logic } from 'src/types';
import { getProtocolTokenList } from 'src/api';
import * as logics from '@protocolink/logics';

export type BorrowFields = Declasifying<logics.aavev2.BorrowLogicFields>;

export type BorrowLogic = Logic<BorrowFields>;

export async function getBorrowTokenList(chainId: number): Promise<logics.aavev2.BorrowLogicTokenList> {
  return getProtocolTokenList(chainId, logics.aavev2.BorrowLogic.rid);
}

export function newBorrowLogic(fields: BorrowFields): BorrowLogic {
  return { rid: logics.aavev2.BorrowLogic.rid, fields };
}
