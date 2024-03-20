import { SwapTokenParams, getSwapTokenQuotation, getSwapTokenTokenList } from './swap-token';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';
import { mainnetTokens } from '@protocolink/test-helpers';

const apiKey = process.env.ZEROEX_API_KEY as string;

describe('ZeroExV4 SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    logics.zeroexv4.SwapTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getSwapTokenTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.mainnet;

    const testCases: SwapTokenParams[] = [
      {
        input: { token: mainnetTokens.ETH, amount: '1' },
        tokenOut: mainnetTokens.USDC,
        apiKey,
      },
      {
        input: { token: mainnetTokens.USDC, amount: '1000' },
        tokenOut: mainnetTokens.ETH,
        apiKey,
      },
      {
        input: { token: mainnetTokens.USDC, amount: '1' },
        tokenOut: mainnetTokens.DAI,
        apiKey,
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
