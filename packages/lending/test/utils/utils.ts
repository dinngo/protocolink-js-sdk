import { BigNumber } from 'ethers';
import { expect } from 'chai';

export function expectEqWithinBps(actual: BigNumber, expected: BigNumber, bps = 1, bpsBase = 10000) {
  const base = BigNumber.from(bpsBase);
  const upper = expected.mul(base.add(BigNumber.from(bps))).div(base);
  const lower = expected.mul(base.sub(BigNumber.from(bps))).div(base);
  expect(actual).to.be.lte(upper);
  expect(actual).to.be.gte(lower);
}
