import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList } from 'src/api';
import * as logics from '@protocolink/logics';

export type MultiSendFields = common.Declasifying<logics.utility.MultiSendLogicFields>;

export type MultiSendLogic = Logic<MultiSendFields>;

export async function getMultiSendTokenList(chainId: number): Promise<logics.utility.MultiSendLogicTokenList> {
  return getProtocolTokenList(chainId, logics.utility.MultiSendLogic.rid);
}

export function newMultiSendLogic(fields: MultiSendFields): MultiSendLogic {
  return { rid: logics.utility.MultiSendLogic.rid, fields };
}
