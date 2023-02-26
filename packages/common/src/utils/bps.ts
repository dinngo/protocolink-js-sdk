import { BPS_BASE } from '../constants';
import { BigNumber, BigNumberish, constants } from 'ethers';

export function calcAmountBps(amountWei: BigNumberish, balanceWei: BigNumberish) {
  return BigNumber.from(amountWei).mul(BPS_BASE).div(balanceWei);
}

export function validateAmountBps(amountBps: BigNumberish) {
  amountBps = BigNumber.from(amountBps);
  return (amountBps.gt(0) && amountBps.lte(BPS_BASE)) || amountBps.eq(constants.MaxUint256);
}
