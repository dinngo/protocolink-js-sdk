import { BigNumberish, constants } from 'ethers';
import { FeeRoundingMode, calcBps, calcFee, reverseAmountWithFee, validateBps } from './bps';
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

describe('Test calcFee', function () {
  const testCases: { amountWei: BigNumberish; feeBps: number; mode: FeeRoundingMode; expected: BigNumberish }[] = [
    // aave v2
    { amountWei: 999100, feeBps: 9, mode: 'floor', expected: 899 },
    { amountWei: 99910080, feeBps: 9, mode: 'floor', expected: 89919 },
    { amountWei: '999100809271655510', feeBps: 9, mode: 'floor', expected: '899190728344489' },
    // aave v3
    { amountWei: 999500, feeBps: 5, mode: 'round', expected: 500 },
    { amountWei: 99950024, feeBps: 5, mode: 'round', expected: 49975 },
    { amountWei: '999500249875062468', feeBps: 5, mode: 'round', expected: '499750124937531' },
  ];

  testCases.forEach(({ amountWei, feeBps, mode, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(calcFee(amountWei, feeBps, mode)).to.eq(expected);
    });
  });
});

describe('Test reverseFee', function () {
  const testCases = [
    // aave v2
    { amountWithFeeWei: 1000000, feeBps: 9, expected: 999100 },
    { amountWithFeeWei: 100000000, feeBps: 9, expected: 99910080 },
    { amountWithFeeWei: '1000000000000000000', feeBps: 9, expected: '999100809271655510' },
    // aave v3
    { amountWithFeeWei: 1000000, feeBps: 5, expected: 999500 },
    { amountWithFeeWei: 100000000, feeBps: 5, expected: 99950024 },
    { amountWithFeeWei: '1000000000000000000', feeBps: 5, expected: '999500249875062468' },
  ];

  testCases.forEach(({ amountWithFeeWei, feeBps, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(reverseAmountWithFee(amountWithFeeWei, feeBps)).to.eq(expected);
    });
  });
});
