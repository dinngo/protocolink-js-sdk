import { FlashLoanFields, FlashLoanLogic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';
import { v4 as uuid } from 'uuid';

export type FlashLoanParams = common.Declasifying<logics.aavev2.FlashLoanLogicParams>;

export async function getFlashLoanTokenList(chainId: number): Promise<logics.aavev2.FlashLoanLogicTokenList> {
  return getProtocolTokenList(chainId, logics.aavev2.FlashLoanLogic.rid);
}

export async function getFlashLoanQuotation(
  chainId: number,
  params: FlashLoanParams
): Promise<logics.aavev2.FlashLoanLogicQuotation> {
  return quote(chainId, logics.aavev2.FlashLoanLogic.rid, params);
}

export function newFlashLoanLogic(fields: FlashLoanFields): FlashLoanLogic {
  return { rid: logics.aavev2.FlashLoanLogic.rid, fields };
}

export function newFlashLoanLogicPair(outputs: FlashLoanFields['outputs']): [FlashLoanLogic, FlashLoanLogic] {
  const id = uuid();
  return [newFlashLoanLogic({ id, outputs, isLoan: true }), newFlashLoanLogic({ id, outputs, isLoan: false })];
}
