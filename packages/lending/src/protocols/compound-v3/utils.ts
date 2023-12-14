import { BigNumber } from 'ethers';
import BigNumberJS from 'bignumber.js';
import { SECONDS_PER_YEAR } from './constants';
import * as common from '@protocolink/common';

export function calcAPR(rate: BigNumber) {
  return common.toBigUnit(rate.mul(SECONDS_PER_YEAR), 18);
}

export function calcUtilization(borrowCapacityUSD: string | BigNumberJS, borrowUSD: string | BigNumberJS) {
  let utilization = '0';
  borrowCapacityUSD = new BigNumberJS(borrowCapacityUSD);
  if (!borrowCapacityUSD.isZero()) {
    utilization = common.formatBigUnit(new BigNumberJS(borrowUSD).div(borrowCapacityUSD), 4);
  }

  return utilization;
}

export function calcHealthRate(
  collateralUSD: string | BigNumberJS,
  borrowUSD: string | BigNumberJS,
  liquidationThreshold: string | BigNumberJS
) {
  borrowUSD = new BigNumberJS(borrowUSD);

  let healthRate = 'Infinity';
  if (!borrowUSD.isZero()) {
    healthRate = common.formatBigUnit(new BigNumberJS(collateralUSD).times(liquidationThreshold).div(borrowUSD), 2);
  }

  return healthRate;
}

export function calcNetAPR(
  supplyUSD: string | BigNumberJS,
  positiveProportion: string | BigNumberJS,
  borrowUSD: string | BigNumberJS,
  negativeProportion: string | BigNumberJS,
  collateralUSD: string | BigNumberJS
) {
  const totalSupplyUSD = new BigNumberJS(supplyUSD).plus(collateralUSD);
  borrowUSD = new BigNumberJS(borrowUSD);

  let earnedAPY = new BigNumberJS(0);
  if (!totalSupplyUSD.isZero()) {
    earnedAPY = new BigNumberJS(positiveProportion).div(totalSupplyUSD);
  }

  let debtAPY = new BigNumberJS(0);
  if (!borrowUSD.isZero()) {
    debtAPY = new BigNumberJS(negativeProportion).div(borrowUSD);
  }

  let netWorthUSD = new BigNumberJS(totalSupplyUSD).minus(borrowUSD);
  if (netWorthUSD.isZero()) {
    netWorthUSD = new BigNumberJS(1);
  }

  let netAPY = '0';
  if (netWorthUSD.gt(0)) {
    netAPY = common.formatBigUnit(
      earnedAPY.times(totalSupplyUSD).div(netWorthUSD).minus(debtAPY.times(borrowUSD).div(netWorthUSD)),
      4
    );
  }

  return netAPY;
}
