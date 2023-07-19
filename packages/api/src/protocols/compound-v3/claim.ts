import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import { getProtocolTokenList, quote } from 'src/api';
import * as logics from '@protocolink/logics';

export type ClaimParams = common.Declasifying<logics.compoundv3.ClaimLogicParams>;

export type ClaimFields = common.Declasifying<logics.compoundv3.ClaimLogicFields>;

export type ClaimLogic = Logic<ClaimFields>;

export async function getClaimTokenList(chainId: number): Promise<logics.compoundv3.ClaimLogicTokenList> {
  return getProtocolTokenList(chainId, logics.compoundv3.ClaimLogic.rid);
}

export async function getClaimQuotation(
  chainId: number,
  params: ClaimParams
): Promise<logics.compoundv3.ClaimLogicFields> {
  return quote(chainId, logics.compoundv3.ClaimLogic.rid, params);
}

export function newClaimLogic(fields: ClaimFields): ClaimLogic {
  return { rid: logics.compoundv3.ClaimLogic.rid, fields };
}
