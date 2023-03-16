import { TokenToTokenParams, isTokenToTokenExactInParams, isTokenToTokenExactOutParams } from './logic-types';
import * as common from '@composable-router/common';
import { expect } from 'chai';
import { mainnetTokens } from '@composable-router/test-helpers';

describe('Test TokenToTokenParams', function () {
  const paramsExactIn: TokenToTokenParams = {
    input: new common.TokenAmount(mainnetTokens.USDC, '1'),
    tokenOut: mainnetTokens.DAI,
  };
  const paramsExactOut: TokenToTokenParams = {
    tokenIn: mainnetTokens.USDC,
    output: new common.TokenAmount(mainnetTokens.DAI, '1'),
  };

  context('Test isTokenToTokenExactInParams', function () {
    const testCases = [
      { params: paramsExactIn, expected: true },
      { params: paramsExactOut, expected: false },
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
      { params: paramsExactIn, expected: false },
      { params: paramsExactOut, expected: true },
      { params: {}, expected: false },
    ];

    testCases.forEach(({ params, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        expect(isTokenToTokenExactOutParams(params)).to.eq(expected);
      });
    });
  });
});
