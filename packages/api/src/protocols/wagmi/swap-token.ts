import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SwapTokenParams = common.Declasifying<logics.wagmi.SwapTokenLogicParams>;

export type SwapTokenFields = common.Declasifying<logics.wagmi.SwapTokenLogicFields>;

export type SwapTokenLogic = Logic<SwapTokenFields>;

export async function getSwapTokenTokenList(chainId: number): Promise<logics.wagmi.SwapTokenLogicTokenList> {
  return getProtocolTokenList(chainId, logics.wagmi.SwapTokenLogic.rid);
}

export async function getSwapTokenQuotation(
  chainId: number,
  params: SwapTokenParams
): Promise<logics.wagmi.SwapTokenLogicFields> {
  return quote(chainId, logics.wagmi.SwapTokenLogic.rid, params);
}

export function newSwapTokenLogic(fields: SwapTokenFields): SwapTokenLogic {
  return { rid: logics.wagmi.SwapTokenLogic.rid, fields };
}
