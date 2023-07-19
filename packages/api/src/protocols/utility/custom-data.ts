import { Logic } from 'src/types';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export type CustomDataFields = common.Declasifying<logics.utility.CustomDataLogicFields>;

export type CustomDataLogic = Logic<CustomDataFields>;

export function newCustomDataLogic(fields: CustomDataFields): CustomDataLogic {
  return { rid: logics.utility.CustomDataLogic.rid, fields };
}
