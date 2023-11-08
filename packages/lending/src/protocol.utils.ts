import BigNumberJS from 'bignumber.js';
import Decimal from 'decimal.js-light';

export function calcUtilization(totalBorrowCapacityUSD: string | BigNumberJS, totalBorrowUSD: string | BigNumberJS) {
  let utilization = '0';
  if (!new BigNumberJS(totalBorrowCapacityUSD).isZero()) {
    utilization = new BigNumberJS(totalBorrowUSD).div(totalBorrowCapacityUSD).toFixed();
  }

  return utilization;
}

export function calcHealthRate(
  totalCollateralUSD: string | BigNumberJS,
  totalBorrowUSD: string | BigNumberJS,
  liquidationLimit: string | BigNumberJS
) {
  totalBorrowUSD = new BigNumberJS(totalBorrowUSD);

  let healthRate = 'Infinity';
  if (!totalBorrowUSD.isZero()) {
    totalCollateralUSD = new BigNumberJS(totalCollateralUSD);

    const avgLiquidationThreshold = totalCollateralUSD.isZero()
      ? new BigNumberJS(0)
      : new BigNumberJS(liquidationLimit).div(totalCollateralUSD);

    healthRate = totalCollateralUSD.times(avgLiquidationThreshold).div(totalBorrowUSD).toFixed();
  }

  return healthRate;
}

export function calcNetAPY(
  totalCollateralUSD: string | BigNumberJS,
  positiveProportion: string | BigNumberJS,
  totalBorrowUSD: string | BigNumberJS,
  negativeProportion: string | BigNumberJS
) {
  totalCollateralUSD = new BigNumberJS(totalCollateralUSD);
  totalBorrowUSD = new BigNumberJS(totalBorrowUSD);

  let earnedAPY = new BigNumberJS(0);
  if (!totalCollateralUSD.isZero()) {
    earnedAPY = new BigNumberJS(positiveProportion).div(totalCollateralUSD);
  }

  let debtAPY = new BigNumberJS(0);
  if (!totalBorrowUSD.isZero()) {
    debtAPY = new BigNumberJS(negativeProportion).div(totalBorrowUSD);
  }

  let netWorthUSD = new BigNumberJS(totalCollateralUSD).minus(totalBorrowUSD);
  if (netWorthUSD.isZero()) {
    netWorthUSD = new BigNumberJS(1);
  }

  let netAPY = '0';
  if (netWorthUSD.gt(0)) {
    netAPY = earnedAPY
      .times(totalCollateralUSD)
      .div(netWorthUSD)
      .minus(debtAPY.times(totalBorrowUSD).div(netWorthUSD))
      .toFixed();
  }

  return netAPY;
}

export interface ToFixedOptions {
  baseDecimals?: number;
  displayDecimals?: number;
  useLessThan?: boolean;
  useApproximation?: boolean;
  round?: boolean;
  ceil?: boolean;
  trim?: boolean;
  significantDigits?: number;
}

export function formatPercentage(number: string): string {
  return (parseFloat(number) * 100).toFixed(2) + '%';
}

export function abbreviateUSD(num: number | string, digits = 2) {
  num = typeof num === 'string' ? Number(num) : num;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
    style: 'currency',
    currency: 'USD',
    ...(num > 10000 ? { notation: 'compact', compactDisplay: 'short' } : {}),
  }).format(num);
}

export function toLessThanString(amount: string | BigNumberJS, decimals: number) {
  amount = new BigNumberJS(amount);
  const minAmount = new BigNumberJS(1).shiftedBy(-decimals);

  return amount.gt(minAmount) ? amount.toFixed() : `<${minAmount.toFixed()}`;
}

export type RoundingMode = 'ceil' | 'round' | 'floor';
export function toSignificantDigits(amount: string, decimals: number, mode?: RoundingMode) {
  return new Decimal(amount)
    .toSignificantDigits(
      decimals,
      mode === 'round' ? Decimal.ROUND_HALF_UP : mode === 'ceil' ? Decimal.ROUND_UP : Decimal.ROUND_DOWN
    )
    .toFixed();
}
