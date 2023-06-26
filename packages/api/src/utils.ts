import { Classifying } from './types';
import * as common from '@protocolink/common';

export function classifying<T extends Record<string, any> | any[] = any>(fields: T): Classifying<T> {
  if (Array.isArray(fields)) {
    return fields.map((item) => classifying(item)) as Classifying<T>;
  } else {
    const transformed: Record<string, any> = {};
    Object.keys(fields).forEach((key) => {
      const value = fields[key];
      transformed[key] = common.isTokenObject(value)
        ? common.Token.from(value)
        : common.isTokenAmountObject(value)
        ? common.TokenAmount.from(value)
        : common.isTokenAmountObjects(value)
        ? common.TokenAmounts.from(value)
        : value;
    });

    return transformed as Classifying<T>;
  }
}
