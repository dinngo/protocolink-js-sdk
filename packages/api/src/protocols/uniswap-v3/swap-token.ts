import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SwapTokenParams = common.Declasifying<logics.uniswapv3.SwapTokenLogicParams>;

export type SwapTokenFields = common.Declasifying<logics.uniswapv3.SwapTokenLogicFields>;

export type SwapTokenLogic = Logic<SwapTokenFields>;

export async function getSwapTokenTokenList(chainId: number): Promise<logics.uniswapv3.SwapTokenLogicTokenList> {
  return getProtocolTokenList(chainId, logics.uniswapv3.SwapTokenLogic.rid);
}

export async function getSwapTokenQuotation(
  chainId: number,
  params: SwapTokenParams
): Promise<logics.uniswapv3.SwapTokenLogicFields> {
  return quote(chainId, logics.uniswapv3.SwapTokenLogic.rid, params);
}

export function newSwapTokenLogic(fields: SwapTokenFields): SwapTokenLogic {
  return { rid: logics.uniswapv3.SwapTokenLogic.rid, fields };
}
