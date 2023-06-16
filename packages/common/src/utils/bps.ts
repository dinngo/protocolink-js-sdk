import { BPS_BASE } from '../constants';
import { BigNumber, BigNumberish } from 'ethers';

export function calcBps(numerator: BigNumberish, denominator: BigNumberish) {
  return BigNumber.from(numerator).mul(BPS_BASE).div(denominator);
}

export function validateBps(bps: BigNumberish) {
  bps = BigNumber.from(bps);
  return bps.gt(0) && bps.lte(BPS_BASE);
}
