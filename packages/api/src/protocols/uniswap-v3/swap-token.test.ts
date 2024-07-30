import { SwapTokenParams, getSwapTokenQuotation, getSwapTokenTokenList } from './swap-token';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('UniswapV3 SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    logics.uniswapv3.SwapTokenLogic.supportedChainIds.forEach((chainId) => {
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
        input: { token: common.mainnetTokens.ETH, amount: '1' },
        tokenOut: common.mainnetTokens.USDC,
      },
      {
        input: { token: common.mainnetTokens.USDC, amount: '1' },
        tokenOut: common.mainnetTokens.ETH,
      },
      {
        input: { token: common.mainnetTokens.USDC, amount: '1' },
        tokenOut: common.mainnetTokens.DAI,
      },
      {
        tokenIn: common.mainnetTokens.ETH,
        output: { token: common.mainnetTokens.USDC, amount: '1' },
      },
      {
        tokenIn: common.mainnetTokens.USDC,
        output: { token: common.mainnetTokens.ETH, amount: '1' },
      },
      {
        tokenIn: common.mainnetTokens.USDC,
        output: { token: common.mainnetTokens.DAI, amount: '1' },
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getSwapTokenQuotation(chainId, params);
        expect(quotation).to.include.all.keys('tradeType', 'input', 'output');
        expect(quotation).to.have.any.keys('path', 'fee');
      });
    });
  });
});
