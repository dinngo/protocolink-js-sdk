import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export type PullTokenFields = common.Declasifying<logics.permit2.PullTokenLogicFields>;

export type PullTokenLogic = Logic<PullTokenFields>;

export function newPullTokenLogic(fields: PullTokenFields): PullTokenLogic {
  return { rid: logics.permit2.PullTokenLogic.rid, fields };
}
