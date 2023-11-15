import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type SwapTokenParams = common.Declasifying<logics.openoceanv2.SwapTokenLogicParams>;

export type SwapTokenFields = common.Declasifying<logics.openoceanv2.SwapTokenLogicFields>;

export type SwapTokenLogic = Logic<SwapTokenFields>;

export async function getSwapTokenTokenList(chainId: number): Promise<logics.openoceanv2.SwapTokenLogicTokenList> {
  return getProtocolTokenList(chainId, logics.openoceanv2.SwapTokenLogic.rid);
}

export async function getSwapTokenQuotation(
  chainId: number,
  params: SwapTokenParams
): Promise<logics.openoceanv2.SwapTokenLogicFields> {
  return quote(chainId, logics.openoceanv2.SwapTokenLogic.rid, params);
}

export function newSwapTokenLogic(fields: SwapTokenFields): SwapTokenLogic {
  return { rid: logics.openoceanv2.SwapTokenLogic.rid, fields };
}
