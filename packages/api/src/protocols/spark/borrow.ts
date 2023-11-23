import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList } from 'src/api';
import * as logics from '@protocolink/logics';

export type BorrowFields = common.Declasifying<logics.spark.BorrowLogicFields>;

export type BorrowLogic = Logic<BorrowFields>;

export async function getBorrowTokenList(chainId: number): Promise<logics.spark.BorrowLogicTokenList> {
  return getProtocolTokenList(chainId, logics.spark.BorrowLogic.rid);
}

export function newBorrowLogic(fields: BorrowFields): BorrowLogic {
  return { rid: logics.spark.BorrowLogic.rid, fields };
}
