import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SwapTokenParams = common.Declasifying<logics.zeroexv4.SwapTokenLogicParams>;

export type SwapTokenFields = common.Declasifying<logics.zeroexv4.SwapTokenLogicFields>;

export type SwapTokenLogic = Logic<SwapTokenFields>;

export async function getSwapTokenTokenList(chainId: number): Promise<logics.zeroexv4.SwapTokenLogicTokenList> {
  return getProtocolTokenList(chainId, logics.zeroexv4.SwapTokenLogic.rid);
}

export async function getSwapTokenQuotation(
  chainId: number,
  params: SwapTokenParams
): Promise<logics.zeroexv4.SwapTokenLogicFields> {
  return quote(chainId, logics.zeroexv4.SwapTokenLogic.rid, params);
}

export function newSwapTokenLogic(fields: SwapTokenFields): SwapTokenLogic {
  return { rid: logics.zeroexv4.SwapTokenLogic.rid, fields };
}
