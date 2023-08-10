import { BPS_BASE } from '../constants';
import { BigNumber, BigNumberish } from 'ethers';
import BigNumberJS from 'bignumber.js';

export function calcBps(numerator: BigNumberish, denominator: BigNumberish) {
  return BigNumber.from(numerator).mul(BPS_BASE).div(denominator);
}

export function validateBps(bps: BigNumberish) {
  bps = BigNumber.from(bps);
  return bps.gt(0) && bps.lte(BPS_BASE);
}

// https://github.com/aave/aave-v3-core/blob/v1.19.1/contracts/protocol/libraries/math/PercentageMath.sol#L9
export function calcFee(amountWei: BigNumberish, feeBps: number) {
  return BigNumber.from(
    new BigNumberJS(amountWei.toString())
      .times(feeBps)
      .plus(0.5)
      .div(BPS_BASE)
      .decimalPlaces(0, BigNumberJS.ROUND_HALF_UP)
      .toString()
  );
}

export function reverseAmountWithFee(amountWithFeeWei: BigNumberish, feeBps: number) {
  return BigNumber.from(amountWithFeeWei)
    .mul(BPS_BASE)
    .div(BPS_BASE + feeBps);
}
