import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type WrappedNativeTokenParams = common.Declasifying<logics.utility.WrappedNativeTokenLogicParams>;

export type WrappedNativeTokenFields = common.Declasifying<logics.utility.WrappedNativeTokenLogicFields>;

export type WrappedNativeTokenLogic = Logic<WrappedNativeTokenFields>;

export async function getWrappedNativeTokenTokenList(
  chainId: number
): Promise<logics.utility.WrappedNativeTokenLogicTokenList> {
  return getProtocolTokenList(chainId, logics.utility.WrappedNativeTokenLogic.rid);
}

export async function getWrappedNativeTokenQuotation(
  chainId: number,
  params: WrappedNativeTokenParams
): Promise<logics.utility.WrappedNativeTokenLogicFields> {
  return quote(chainId, logics.utility.WrappedNativeTokenLogic.rid, params);
}

export function newWrappedNativeTokenLogic(fields: WrappedNativeTokenFields): WrappedNativeTokenLogic {
  return { rid: logics.utility.WrappedNativeTokenLogic.rid, fields };
}
