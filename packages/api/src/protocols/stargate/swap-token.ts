import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SwapTokenParams = common.Declasifying<logics.stargate.SwapTokenLogicParams>;

export type SwapTokenFields = common.Declasifying<logics.stargate.SwapTokenLogicFields>;

export type SwapTokenLogic = Logic<SwapTokenFields>;

export async function getSwapTokenTokenList(chainId: number): Promise<logics.stargate.SwapTokenLogicTokenList> {
  return getProtocolTokenList(chainId, logics.stargate.SwapTokenLogic.rid);
}

export async function getSwapTokenQuotation(
  chainId: number,
  params: SwapTokenParams
): Promise<logics.stargate.SwapTokenLogicFields> {
  return quote(chainId, logics.stargate.SwapTokenLogic.rid, params);
}

export function newSwapTokenLogic(fields: SwapTokenFields): SwapTokenLogic {
  return { rid: logics.stargate.SwapTokenLogic.rid, fields };
}
