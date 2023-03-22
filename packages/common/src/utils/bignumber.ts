import { BigNumber, BigNumberish, utils } from 'ethers';
import BigNumberJS from 'bignumber.js';

export function toSmallUnit(amount: string, decimals: number) {
  return Number(amount) === 0
    ? BigNumber.from(0)
    : utils.parseUnits(BigNumberJS(amount).decimalPlaces(decimals, BigNumberJS.ROUND_DOWN).toFixed(), decimals);
}

export interface ToBigUnitOptions {
  displayDecimals?: number;
  mode?: string | 'ceil' | 'round' | 'floor';
}

export function toBigUnit(amountWei: BigNumberish, decimals: number, options: ToBigUnitOptions = {}) {
  const { displayDecimals, mode } = options;

  return BigNumberJS(amountWei.toString())
    .shiftedBy(-decimals)
    .decimalPlaces(
      displayDecimals ? displayDecimals : decimals,
      mode === 'round' ? BigNumberJS.ROUND_HALF_UP : mode === 'ceil' ? BigNumberJS.ROUND_CEIL : BigNumberJS.ROUND_FLOOR
    )
    .toFixed();
}

export function calcSlippage(amountWei: BigNumberish, slippage: number, base = 10000) {
  amountWei = BigNumber.from(amountWei);
  return amountWei.isZero() ? amountWei : amountWei.mul(base - slippage).div(base);
}

export function calcFee(amountWei: BigNumberish, premium: number, base = 10000) {
  return BigNumber.from(amountWei).mul(premium).div(base);
}
