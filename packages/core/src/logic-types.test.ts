import {
  FlashLoanParams,
  TokenToTokenParams,
  isFlashLoanLoanParams,
  isFlashLoanRepayParams,
  isTokenToTokenExactInParams,
  isTokenToTokenExactOutParams,
} from './logic-types';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { mainnetTokens } from '@protocolink/test-helpers';

describe('Test TokenToTokenParams', function () {
  const exactInParams: TokenToTokenParams = {
    input: new common.TokenAmount(mainnetTokens.USDC, '1'),
    tokenOut: mainnetTokens.DAI,
  };
  const exactOutParams: TokenToTokenParams = {
    tokenIn: mainnetTokens.USDC,
    output: new common.TokenAmount(mainnetTokens.DAI, '1'),
  };

  context('Test isTokenToTokenExactInParams', function () {
    const testCases = [
      { params: exactInParams, expected: true },
      { params: exactOutParams, expected: false },
      { params: {}, expected: false },
    ];

    testCases.forEach(({ params, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        expect(isTokenToTokenExactInParams(params)).to.eq(expected);
      });
    });
  });

  context('Test isTokenToTokenExactOutParams', function () {
    const testCases = [
      { params: exactInParams, expected: false },
      { params: exactOutParams, expected: true },
      { params: {}, expected: false },
    ];

    testCases.forEach(({ params, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        expect(isTokenToTokenExactOutParams(params)).to.eq(expected);
      });
    });
  });
});

describe('Test FlashLoanParams', function () {
  const loanParams: FlashLoanParams = {
    loans: new common.TokenAmounts([
      { token: mainnetTokens.USDC, amount: '1' },
      { token: mainnetTokens.DAI, amount: '1' },
    ]),
  };
  const repayParams: FlashLoanParams = {
    repays: new common.TokenAmounts([
      { token: mainnetTokens.USDC, amount: '1' },
      { token: mainnetTokens.DAI, amount: '1' },
    ]),
  };

  context('Test isFlashLoanLoanParams', function () {
    const testCases = [
      { params: loanParams, expected: true },
      { params: repayParams, expected: false },
      { params: {}, expected: false },
    ];

    testCases.forEach(({ params, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        expect(isFlashLoanLoanParams(params)).to.eq(expected);
      });
    });
  });

  context('Test isFlashLoanRepayParams', function () {
    const testCases = [
      { params: loanParams, expected: false },
      { params: repayParams, expected: true },
      { params: {}, expected: false },
    ];

    testCases.forEach(({ params, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        expect(isFlashLoanRepayParams(params)).to.eq(expected);
      });
    });
  });
});
