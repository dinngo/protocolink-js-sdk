import { calcBps, validateBps } from './bps';
import { constants } from 'ethers';
import { expect } from 'chai';

describe('Test calcBps', function () {
  const testCases = [
    { numerator: 0, denominator: 200, expected: 0 },
    { numerator: 20, denominator: 200, expected: 1000 },
    { numerator: 100, denominator: 200, expected: 5000 },
    { numerator: 123, denominator: 200, expected: 6150 },
    { numerator: 123, denominator: 456, expected: 2697 },
    { numerator: 200, denominator: 200, expected: 10000 },
  ];

  testCases.forEach(({ numerator, denominator, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(calcBps(numerator, denominator)).to.eq(expected);
    });
  });
});

describe('Test validateBps', function () {
  const testCases = [
    { bps: -1, expected: false },
    { bps: 0, expected: false },
    { bps: 1000, expected: true },
    { bps: 10000, expected: true },
    { bps: 100000, expected: false },
    { bps: constants.MaxUint256, expected: false },
  ];

  testCases.forEach(({ bps, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(validateBps(bps)).to.eq(expected);
    });
  });
});
