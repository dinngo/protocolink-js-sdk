import { BigNumber } from 'ethers';
import { SECONDS_PER_YEAR } from './constants';
import * as common from '@protocolink/common';

export function calcAPR(rate: BigNumber) {
  return common.toBigUnit(rate.mul(SECONDS_PER_YEAR), 18);
}
