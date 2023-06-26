import { Declasifying, Logic } from 'src/types';
import * as logics from '@protocolink/logics';

export type CustomDataFields = Declasifying<logics.utility.CustomDataLogicFields>;

export type CustomDataLogic = Logic<CustomDataFields>;

export function newCustomDataLogic(fields: CustomDataFields): CustomDataLogic {
  return { rid: logics.utility.CustomDataLogic.rid, fields };
}
