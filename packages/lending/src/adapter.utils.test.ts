import * as common from '@protocolink/common';
import { expect } from 'chai';
import { scaleRepayAmount } from './adapter.utils';

describe('Test scaleRepayAmount', function () {
  const testCases = [
    { token: common.mainnetTokens.WETH, amount: '1', scale: 100, expected: '1.01' },
    { token: common.mainnetTokens.WETH, amount: '0.00001', scale: 100, expected: '0.0000101' },
    { token: common.mainnetTokens.USDC, amount: '1', scale: 100, expected: '1.01' },
    { token: common.mainnetTokens.USDC, amount: '0.00001', scale: 100, expected: '0.00001' },
  ];

  testCases.forEach(({ token, amount, scale, expected }, i) => {
    it(`case ${i + 1}`, async function () {
      expect(scaleRepayAmount(token, amount, scale)).to.eq(expected);
    });
  });
});
