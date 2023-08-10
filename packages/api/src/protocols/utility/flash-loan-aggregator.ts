import { FlashLoanLogicFields, Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';
import { v4 as uuid } from 'uuid';

export type FlashLoanAggregatorParams = common.Declasifying<logics.utility.FlashLoanAggregatorLogicParams>;

export type FlashLoanAggregatorLogicFields = FlashLoanLogicFields & { protocolId: string };

export type FlashLoanAggregatorFields = common.Declasifying<FlashLoanAggregatorLogicFields>;

export type FlashLoanAggregatorLogic = Logic<FlashLoanAggregatorFields>;

export async function getFlashLoanAggregatorTokenList(
  chainId: number
): Promise<logics.utility.FlashLoanAggregatorLogicTokenList> {
  return getProtocolTokenList(chainId, logics.utility.FlashLoanAggregatorLogic.rid);
}

export async function getFlashLoanAggregatorQuotation(
  chainId: number,
  params: FlashLoanAggregatorParams
): Promise<logics.utility.FlashLoanAggregatorLogicQuotation> {
  return quote(chainId, logics.utility.FlashLoanAggregatorLogic.rid, params);
}

export function newFlashLoanAggregatorLogic(fields: FlashLoanAggregatorFields): FlashLoanAggregatorLogic {
  return { rid: logics.utility.FlashLoanAggregatorLogic.rid, fields };
}

export function newFlashLoanAggregatorLogicPair(
  protocolId: string,
  loans: FlashLoanAggregatorFields['loans']
): [FlashLoanAggregatorLogic, FlashLoanAggregatorLogic] {
  const id = uuid();
  return [
    newFlashLoanAggregatorLogic({ id, protocolId, loans, isLoan: true }),
    newFlashLoanAggregatorLogic({ id, protocolId, loans, isLoan: false }),
  ];
}
