import { PermitBatch, PermitSingle } from '@uniswap/permit2-sdk';

export function getDeadline(expiration: number) {
  return Math.floor(Date.now() / 1000) + expiration;
}

export function isPermitSingle(permit: PermitSingle | PermitBatch): permit is PermitSingle {
  return !Array.isArray(permit.details);
}
