import { FlashLoanFields, FlashLoanLogic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';
import { v4 as uuid } from 'uuid';

export type FlashLoanParams = common.Declasifying<logics.morphoblue.FlashLoanLogicParams>;

export async function getFlashLoanTokenList(chainId: number): Promise<logics.morphoblue.FlashLoanLogicTokenList> {
  return getProtocolTokenList(chainId, logics.morphoblue.FlashLoanLogic.rid);
}

export async function getFlashLoanQuotation(
  chainId: number,
  params: FlashLoanParams
): Promise<logics.morphoblue.FlashLoanLogicQuotation> {
  return quote(chainId, logics.morphoblue.FlashLoanLogic.rid, params);
}

export function newFlashLoanLogic(fields: FlashLoanFields): FlashLoanLogic {
  return { rid: logics.morphoblue.FlashLoanLogic.rid, fields };
}

export function newFlashLoanLogicPair(loans: FlashLoanFields['loans']): [FlashLoanLogic, FlashLoanLogic] {
  const id = uuid();
  return [newFlashLoanLogic({ id, loans, isLoan: true }), newFlashLoanLogic({ id, loans, isLoan: false })];
}
