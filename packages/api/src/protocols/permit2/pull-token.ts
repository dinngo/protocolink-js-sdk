import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList } from 'src/api';
import * as logics from '@protocolink/logics';

export type PullTokenFields = common.Declasifying<logics.permit2.PullTokenLogicFields>;

export type PullTokenLogic = Logic<PullTokenFields>;

export async function getPullTokenTokenList(chainId: number): Promise<logics.permit2.PullTokenLogicTokenList> {
  return getProtocolTokenList(chainId, logics.permit2.PullTokenLogic.rid);
}

export function newPullTokenLogic(fields: PullTokenFields): PullTokenLogic {
  return { rid: logics.permit2.PullTokenLogic.rid, fields };
}
