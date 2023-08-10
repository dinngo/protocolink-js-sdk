import { BPS_BASE } from '../constants';
import { BigNumber, BigNumberish } from 'ethers';

export function calcBps(numerator: BigNumberish, denominator: BigNumberish) {
  return BigNumber.from(numerator).mul(BPS_BASE).div(denominator);
}

export function validateBps(bps: BigNumberish) {
  bps = BigNumber.from(bps);
  return bps.gt(0) && bps.lte(BPS_BASE);
}

export type FeeRoundingMode = 'round' | 'floor';

// Aave v2: floor
// - https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol#L483
// - https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol#L504
// Aave v3: round
// - https://github.com/aave/aave-v3-core/blob/v1.19.1/contracts/protocol/libraries/logic/FlashLoanLogic.sol#L70
// - https://github.com/aave/aave-v3-core/blob/v1.19.1/contracts/protocol/libraries/logic/FlashLoanLogic.sol#L94
// - https://github.com/aave/aave-v3-core/blob/v1.19.1/contracts/protocol/libraries/math/PercentageMath.sol#L9
export function calcFee(amountWei: BigNumberish, feeBps: number, mode: FeeRoundingMode = 'floor') {
  let fee = BigNumber.from(amountWei).mul(feeBps);
  if (mode === 'round') {
    fee = fee.add(BPS_BASE / 2);
  }
  return fee.div(BPS_BASE);
}

export function reverseAmountWithFee(amountWithFeeWei: BigNumberish, feeBps: number) {
  return BigNumber.from(amountWithFeeWei)
    .mul(BPS_BASE)
    .div(BPS_BASE + feeBps);
}
