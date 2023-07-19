import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SwapTokenParams = common.Declasifying<logics.syncswap.SwapTokenLogicParams>;

export type SwapTokenFields = common.Declasifying<logics.syncswap.SwapTokenLogicFields>;

export type SwapTokenLogic = Logic<SwapTokenFields>;

export async function getSwapTokenTokenList(chainId: number): Promise<logics.syncswap.SwapTokenLogicTokenList> {
  return getProtocolTokenList(chainId, logics.syncswap.SwapTokenLogic.rid);
}

export async function getSwapTokenQuotation(
  chainId: number,
  params: SwapTokenParams
): Promise<logics.syncswap.SwapTokenLogicFields> {
  return quote(chainId, logics.syncswap.SwapTokenLogic.rid, params);
}

export function newSwapTokenLogic(fields: SwapTokenFields): SwapTokenLogic {
  return { rid: logics.syncswap.SwapTokenLogic.rid, fields };
}
