import { Declasifying, Logic } from 'src/types';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type DepositParams = Declasifying<logics.aavev2.DepositLogicParams>;

export type DepositFields = Declasifying<logics.aavev2.DepositLogicFields>;

export type DepositLogic = Logic<DepositFields>;

export async function getDepositTokenList(chainId: number): Promise<logics.aavev2.DepositLogicTokenList> {
  return getProtocolTokenList(chainId, logics.aavev2.DepositLogic.rid);
}

export async function getDepositQuotation(
  chainId: number,
  params: DepositParams
): Promise<logics.aavev2.DepositLogicFields> {
  return quote(chainId, logics.aavev2.DepositLogic.rid, params);
}

export function newDepositLogic(fields: DepositFields): DepositLogic {
  return { rid: logics.aavev2.DepositLogic.rid, fields };
}
