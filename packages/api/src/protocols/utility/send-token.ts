import { Declasifying, Logic } from 'src/types';
import { getProtocolTokenList } from 'src/api';
import * as logics from '@protocolink/logics';

export type SendTokenFields = Declasifying<logics.utility.SendTokenLogicFields>;

export type SendTokenLogic = Logic<SendTokenFields>;

export async function getSendTokenTokenList(chainId: number): Promise<logics.utility.SendTokenLogicTokenList> {
  return getProtocolTokenList(chainId, logics.utility.SendTokenLogic.rid);
}

export function newSendTokenLogic(fields: SendTokenFields): SendTokenLogic {
  return { rid: logics.utility.SendTokenLogic.rid, fields };
}
