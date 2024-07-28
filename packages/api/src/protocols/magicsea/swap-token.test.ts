import { SwapTokenParams, getSwapTokenQuotation, getSwapTokenTokenList } from './swap-token';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('MagicSea SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    logics.magicsea.SwapTokenLogic.supportedChainIds.forEach((chainId) => {
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
        tokenOut: logics.magicsea.iotaTokens['USDC.e'],
      },
      {
        input: { token: logics.magicsea.iotaTokens['USDC.e'], amount: '1' },
        tokenOut: common.iotaTokens.IOTA,
      },
      {
        input: { token: logics.magicsea.iotaTokens['USDC.e'], amount: '1' },
        tokenOut: logics.magicsea.iotaTokens.USDT,
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
