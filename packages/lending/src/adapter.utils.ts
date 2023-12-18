import BigNumberJS from 'bignumber.js';
import * as common from '@protocolink/common';

export function scaleRepayAmount(token: common.Token, amount: string) {
  return new BigNumberJS(amount)
    .times('4.5e-7')
    .plus(amount)
    .decimalPlaces(token.decimals, BigNumberJS.ROUND_UP)
    .toFixed();
}
