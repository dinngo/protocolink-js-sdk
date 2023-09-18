import { BigNumber, utils } from 'ethers';
import { PermitBatch, PermitSingle } from '@uniswap/permit2-sdk';

export function getDeadline(expiration: number) {
  return Math.floor(Date.now() / 1000) + expiration;
}

export function isPermitSingle(permit: PermitSingle | PermitBatch): permit is PermitSingle {
  return !Array.isArray(permit.details);
}

export function encodeReferral(collector: string, rate: number) {
  return BigNumber.from(collector.padEnd(66, '0')).or(BigNumber.from(rate)).toHexString();
}

export function decodeReferral(referral: string) {
  return {
    collector: utils.getAddress(referral.substring(0, 42)),
    rate: BigNumber.from(`0x${referral.slice(42)}`).toNumber(),
  };
}
