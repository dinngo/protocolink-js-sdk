import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SwapTokenParams = common.Declasifying<logics.magicsea.SwapTokenLogicParams>;

export type SwapTokenFields = common.Declasifying<logics.magicsea.SwapTokenLogicFields>;

export type SwapTokenLogic = Logic<SwapTokenFields>;

export async function getSwapTokenTokenList(chainId: number): Promise<logics.magicsea.SwapTokenLogicTokenList> {
  return getProtocolTokenList(chainId, logics.magicsea.SwapTokenLogic.rid);
}

export async function getSwapTokenQuotation(
  chainId: number,
  params: SwapTokenParams
): Promise<logics.magicsea.SwapTokenLogicFields> {
  return quote(chainId, logics.magicsea.SwapTokenLogic.rid, params);
}

export function newSwapTokenLogic(fields: SwapTokenFields): SwapTokenLogic {
  return { rid: logics.magicsea.SwapTokenLogic.rid, fields };
}
