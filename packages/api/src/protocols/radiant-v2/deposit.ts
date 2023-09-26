import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type DepositParams = common.Declasifying<logics.radiantv2.DepositLogicParams>;

export type DepositFields = common.Declasifying<logics.radiantv2.DepositLogicFields>;

export type DepositLogic = Logic<DepositFields>;

export async function getDepositTokenList(chainId: number): Promise<logics.radiantv2.DepositLogicTokenList> {
  return getProtocolTokenList(chainId, logics.radiantv2.DepositLogic.rid);
}

export async function getDepositQuotation(
  chainId: number,
  params: DepositParams
): Promise<logics.radiantv2.DepositLogicFields> {
  return quote(chainId, logics.radiantv2.DepositLogic.rid, params);
}

export function newDepositLogic(fields: DepositFields): DepositLogic {
  return { rid: logics.radiantv2.DepositLogic.rid, fields };
}
