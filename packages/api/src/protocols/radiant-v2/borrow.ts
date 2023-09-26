import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList } from 'src/api';
import * as logics from '@protocolink/logics';

export type BorrowFields = common.Declasifying<logics.radiantv2.BorrowLogicFields>;

export type BorrowLogic = Logic<BorrowFields>;

export async function getBorrowTokenList(chainId: number): Promise<logics.radiantv2.BorrowLogicTokenList> {
  return getProtocolTokenList(chainId, logics.radiantv2.BorrowLogic.rid);
}

export function newBorrowLogic(fields: BorrowFields): BorrowLogic {
  return { rid: logics.radiantv2.BorrowLogic.rid, fields };
}
