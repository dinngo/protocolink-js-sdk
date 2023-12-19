import { expect } from 'chai';
import { mainnetTokens } from './tokens';
import { scaleRepayAmount } from './adapter.utils';

describe('Test scaleRepayAmount', function () {
  const testCases = [
    { token: mainnetTokens.WETH, amount: '1', scale: 100, expected: '1.01' },
    { token: mainnetTokens.WETH, amount: '0.00001', scale: 100, expected: '0.0000101' },
    { token: mainnetTokens.USDC, amount: '1', scale: 100, expected: '1.01' },
    { token: mainnetTokens.USDC, amount: '0.00001', scale: 100, expected: '0.00001' },
  ];

  testCases.forEach(({ token, amount, scale, expected }, i) => {
    it(`case ${i + 1}`, async function () {
      expect(scaleRepayAmount(token, amount, scale)).to.eq(expected);
    });
  });
});
