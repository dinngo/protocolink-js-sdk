import { SwapTokenParams, getSwapTokenQuotation, getSwapTokenTokenList } from './swap-token';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('Syncswap SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    logics.syncswap.SwapTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getSwapTokenTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.zksync;

    const testCases: SwapTokenParams[] = [
      {
        input: { token: common.zksyncTokens.ETH, amount: '1' },
        tokenOut: common.zksyncTokens.USDC,
      },
      {
        input: { token: common.zksyncTokens.USDC, amount: '1' },
        tokenOut: common.zksyncTokens.ETH,
      },
      {
        input: { token: common.zksyncTokens.USDC, amount: '1' },
        tokenOut: common.zksyncTokens.USDT,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getSwapTokenQuotation(chainId, params);
        expect(quotation).to.include.all.keys('input', 'output', 'paths');
      });
    });
  });
});
