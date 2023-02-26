import { calcAmountBps, validateAmountBps } from './bps';
import { constants } from 'ethers';
import { expect } from 'chai';

describe('Test calcAmountBps', function () {
  const testCases = [
    { amountWei: 0, balanceWei: 200, expected: 0 },
    { amountWei: 20, balanceWei: 200, expected: 1000 },
    { amountWei: 100, balanceWei: 200, expected: 5000 },
    { amountWei: 123, balanceWei: 200, expected: 6150 },
    { amountWei: 123, balanceWei: 456, expected: 2697 },
    { amountWei: 200, balanceWei: 200, expected: 10000 },
  ];

  testCases.forEach(({ amountWei, balanceWei, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(calcAmountBps(amountWei, balanceWei)).to.eq(expected);
    });
  });
});

describe('Test validateAmountBps', function () {
  const testCases = [
    { amountBps: -1, expected: false },
    { amountBps: 0, expected: false },
    { amountBps: 1000, expected: true },
    { amountBps: 10000, expected: true },
    { amountBps: 100000, expected: false },
    { amountBps: constants.MaxUint256, expected: true },
  ];

  testCases.forEach(({ amountBps, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(validateAmountBps(amountBps)).to.eq(expected);
    });
  });
});
