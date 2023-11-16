import { SwapTokenParams, getSwapTokenQuotation, getSwapTokenTokenList } from './swap-token';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';
import { metisTokens } from '@protocolink/test-helpers';

describe('OpenOceanV2 SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    logics.openoceanv2.SwapTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getSwapTokenTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.metis;

    const testCases: SwapTokenParams[] = [
      {
        input: { token: metisTokens.METIS, amount: '1' },
        tokenOut: metisTokens.USDC,
      },
      {
        input: { token: metisTokens.USDC, amount: '1' },
        tokenOut: metisTokens.METIS,
      },
      {
        input: { token: metisTokens.USDC, amount: '1' },
        tokenOut: metisTokens.DAI,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getSwapTokenQuotation(chainId, params);
        expect(quotation).to.include.all.keys('input', 'output');
      });
    });
  });
});
