import { Declasifying } from './types';
import { classifying } from './utils';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { mainnetTokens } from '@protocolink/test-helpers';
import * as protocols from './protocols';

describe('Test classifying', function () {
  it('TokenToTokenExactInFields', function () {
    const fieldsObject: Declasifying<core.TokenToTokenExactInFields> = {
      input: { token: mainnetTokens.ETH, amount: '1' },
      output: { token: mainnetTokens.USDC, amount: '1' },
    };
    const fields = classifying(fieldsObject);
    expect(common.isTokenAmount(fields.input)).to.be.true;
    expect(common.isTokenAmount(fields.output)).to.be.true;
  });

  it('TokenToTokenExactInParams', function () {
    const fieldsObject: Declasifying<core.TokenToTokenExactInParams> = {
      input: { token: mainnetTokens.ETH, amount: '1' },
      tokenOut: mainnetTokens.USDC,
    };
    const fields = classifying(fieldsObject);
    expect(common.isTokenAmount(fields.input)).to.be.true;
    expect(common.isToken(fields.tokenOut)).to.be.true;
  });

  it('TokensInFields', function () {
    const fieldsObject: Declasifying<core.TokensInFields> = {
      inputs: [
        { token: mainnetTokens.ETH, amount: '1' },
        { token: mainnetTokens.ETH, amount: '1' },
      ],
    };
    const fields = classifying(fieldsObject);
    expect(common.isTokenAmounts(fields.inputs)).to.be.true;
  });

  it('MultiSendFields', function () {
    const fieldsObject: protocols.utility.MultiSendFields = [
      { input: { token: mainnetTokens.ETH, amount: '1' }, recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      { input: { token: mainnetTokens.WETH, amount: '1' }, recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      { input: { token: mainnetTokens.USDC, amount: '1' }, recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
    ];
    const fields = classifying(fieldsObject);
    for (const item of fields) {
      expect(common.isTokenAmount(item.input)).to.be.true;
    }
  });
});
