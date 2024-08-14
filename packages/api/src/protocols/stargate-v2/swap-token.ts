import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SwapTokenParams = common.Declasifying<logics.stargatev2.SwapTokenLogicParams>;

export type SwapTokenFields = common.Declasifying<logics.stargatev2.SwapTokenLogicFields>;

export type SwapTokenLogic = Logic<SwapTokenFields>;

export async function getSwapTokenTokenList(chainId: number): Promise<logics.stargatev2.SwapTokenLogicTokenList> {
  return getProtocolTokenList(chainId, logics.stargatev2.SwapTokenLogic.rid);
}

export async function getSwapTokenQuotation(
  chainId: number,
  params: SwapTokenParams
): Promise<logics.stargatev2.SwapTokenLogicFields> {
  return quote(chainId, logics.stargatev2.SwapTokenLogic.rid, params);
}

export function newSwapTokenLogic(fields: SwapTokenFields): SwapTokenLogic {
  return { rid: logics.stargatev2.SwapTokenLogic.rid, fields };
}
