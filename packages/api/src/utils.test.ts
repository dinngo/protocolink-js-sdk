import { ToObjectFields } from './types';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import { mainnetTokens } from '@composable-router/test-helpers';
import { toFields } from './utils';

describe('Test toFields', function () {
  it('TokenToTokenFields', function () {
    const fieldsObject: ToObjectFields<core.TokenToTokenFields> = {
      input: { token: mainnetTokens.ETH, amount: '1' },
      output: { token: mainnetTokens.USDC, amount: '1' },
    };
    const fields = toFields<core.TokenToTokenFields>(fieldsObject);
    expect(common.isTokenAmount(fields.input)).to.be.true;
    expect(common.isTokenAmount(fields.output)).to.be.true;
  });

  it('TokenToTokenExactInParams', function () {
    const fieldsObject: ToObjectFields<core.TokenToTokenExactInParams> = {
      input: { token: mainnetTokens.ETH, amount: '1' },
      tokenOut: mainnetTokens.USDC,
    };
    const fields = toFields<core.TokenToTokenExactInParams>(fieldsObject);
    expect(common.isTokenAmount(fields.input)).to.be.true;
    expect(common.isToken(fields.tokenOut)).to.be.true;
  });

  it('TokensInFields', function () {
    const fieldsObject: ToObjectFields<core.TokensInFields> = {
      inputs: [
        { token: mainnetTokens.ETH, amount: '1' },
        { token: mainnetTokens.ETH, amount: '1' },
      ],
    };
    const fields = toFields<core.TokensInFields>(fieldsObject);
    expect(common.isTokenAmounts(fields.inputs)).to.be.true;
  });
});
