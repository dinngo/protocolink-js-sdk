import BigNumberJS from 'bignumber.js';
import Decimal from 'decimal.js-light';
import axios from 'axios';

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
  totalSupplyUSD: string | BigNumberJS,
  positiveProportion: string | BigNumberJS,
  totalBorrowUSD: string | BigNumberJS,
  negativeProportion: string | BigNumberJS
) {
  totalSupplyUSD = new BigNumberJS(totalSupplyUSD);
  totalBorrowUSD = new BigNumberJS(totalBorrowUSD);

  let earnedAPY = new BigNumberJS(0);
  if (!totalSupplyUSD.isZero()) {
    earnedAPY = new BigNumberJS(positiveProportion).div(totalSupplyUSD);
  }

  let debtAPY = new BigNumberJS(0);
  if (!totalBorrowUSD.isZero()) {
    debtAPY = new BigNumberJS(negativeProportion).div(totalBorrowUSD);
  }

  let netWorthUSD = new BigNumberJS(totalSupplyUSD).minus(totalBorrowUSD);
  if (netWorthUSD.isZero()) {
    netWorthUSD = new BigNumberJS(1);
  }

  let netAPY = '0';
  if (netWorthUSD.gt(0)) {
    netAPY = earnedAPY
      .times(totalSupplyUSD)
      .div(netWorthUSD)
      .minus(debtAPY.times(totalBorrowUSD).div(netWorthUSD))
      .toFixed();
  }

  return netAPY;
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

  if (amount.isZero()) {
    return '0';
  }

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

export const lstTokenAPYsURL = 'https://cdn.furucombo.app/lstTokenAPYs.json';

export const filterPortfolio = (portfolio: any) => {
  const { netAPY: _netAPY, supplies, borrows, ...rest } = portfolio || {};

  const processList = (list: any[]) => {
    return list
      .filter(({ balance }) => balance !== '0')
      .map((item) => {
        const { lstApy: _lstApy, grossApy: _grossApy, token, ...rest } = item;
        const { logoUri: _logoUri, ...tokenRest } = token;
        return { ...rest, token: tokenRest };
      })
      .sort((a, b) => a.token.address.localeCompare(b.token.address));
  };

  return {
    ...rest,
    supplies: Array.isArray(supplies) ? processList(supplies) : supplies,
    borrows: Array.isArray(borrows) ? processList(borrows) : borrows,
  };
};

export const getLstApyFromMap = (tokenAddress: string, lstTokenAPYMap: Record<string, string>) => {
  return lstTokenAPYMap[tokenAddress.toLowerCase()] || '0';
};

export const calcSupplyGrossApy = (apy: string, lstApy: string) => {
  return lstApy === '0' ? apy : apy === '0' ? lstApy : BigNumberJS(apy).plus(lstApy).toString();
};

export const calcBorrowGrossApy = (apy: string, lstApy: string) => {
  return lstApy === '0' ? apy : apy === '0' ? lstApy : BigNumberJS(apy).minus(lstApy).toString();
};

export async function fetchReservesData(protocolId: string, chainId: number) {
  const url = `https://s3.amazonaws.com/cdn.protocolink.com/${chainId}/${protocolId.replace(/-/g, '')}/reserves.json`;

  const { data } = await axios.get(url);

  if (!data || !Array.isArray(data) || data.length === 0) throw new Error('Invalid data');

  return data;
}
