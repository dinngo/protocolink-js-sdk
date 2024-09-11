import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type DepositParams = common.Declasifying<logics.iolend.DepositLogicParams>;

export type DepositFields = common.Declasifying<logics.iolend.DepositLogicFields>;

export type DepositLogic = Logic<DepositFields>;

export async function getDepositTokenList(chainId: number): Promise<logics.iolend.DepositLogicTokenList> {
  return getProtocolTokenList(chainId, logics.iolend.DepositLogic.rid);
}

export async function getDepositQuotation(
  chainId: number,
  params: DepositParams
): Promise<logics.iolend.DepositLogicFields> {
  return quote(chainId, logics.iolend.DepositLogic.rid, params);
}

export function newDepositLogic(fields: DepositFields): DepositLogic {
  return { rid: logics.iolend.DepositLogic.rid, fields };
}
