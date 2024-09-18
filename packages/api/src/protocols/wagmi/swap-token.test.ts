import { SwapTokenParams, getSwapTokenQuotation, getSwapTokenTokenList } from './swap-token';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('Wagmi SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    logics.wagmi.SwapTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getSwapTokenTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.iota;

    const testCases: SwapTokenParams[] = [
      {
        input: { token: common.iotaTokens.IOTA, amount: '1' },
        tokenOut: common.iotaTokens.USDT,
      },
      {
        input: { token: common.iotaTokens.USDT, amount: '1' },
        tokenOut: common.iotaTokens.IOTA,
      },
      {
        input: { token: common.iotaTokens.USDT, amount: '1' },
        tokenOut: common.iotaTokens.wIOTA,
      },
      {
        tokenIn: common.iotaTokens.IOTA,
        output: { token: common.iotaTokens.USDT, amount: '1' },
      },
      {
        tokenIn: common.iotaTokens.USDT,
        output: { token: common.iotaTokens.IOTA, amount: '1' },
      },
      {
        tokenIn: common.iotaTokens.USDT,
        output: { token: common.iotaTokens.wIOTA, amount: '1' },
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
