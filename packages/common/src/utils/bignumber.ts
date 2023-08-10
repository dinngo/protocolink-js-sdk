import { BigNumber, BigNumberish, utils } from 'ethers';
import BigNumberJS from 'bignumber.js';

export function toSmallUnit(amount: string | BigNumberJS, decimals: number) {
  amount = BigNumberJS(amount);
  return amount.isZero()
    ? BigNumber.from(0)
    : utils.parseUnits(amount.decimalPlaces(decimals, BigNumberJS.ROUND_DOWN).toFixed(), decimals);
}

export type RoundingMode = 'ceil' | 'round' | 'floor';

export interface ToBigUnitOptions {
  displayDecimals?: number;
  mode?: RoundingMode;
}

export function toBigUnit(amountWei: BigNumberish, decimals: number, options: ToBigUnitOptions = {}) {
  const { displayDecimals, mode } = options;
  return BigNumberJS(amountWei.toString())
    .shiftedBy(-decimals)
    .decimalPlaces(
      displayDecimals ? displayDecimals : decimals,
      mode === 'round' ? BigNumberJS.ROUND_HALF_UP : mode === 'ceil' ? BigNumberJS.ROUND_UP : BigNumberJS.ROUND_DOWN
    )
    .toFixed();
}

export function formatBigUnit(amount: string | BigNumberJS, displayDecimals: number, mode?: RoundingMode) {
  return BigNumberJS(amount)
    .decimalPlaces(
      displayDecimals,
      mode === 'floor' ? BigNumberJS.ROUND_DOWN : mode === 'ceil' ? BigNumberJS.ROUND_UP : BigNumberJS.ROUND_HALF_UP
    )
    .toFixed();
}

export function calcSlippage(amountWei: BigNumberish, slippage: number, base = 10000) {
  amountWei = BigNumber.from(amountWei);
  return amountWei.isZero() ? amountWei : amountWei.mul(base - slippage).div(base);
}
