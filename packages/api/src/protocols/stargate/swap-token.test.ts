import { SwapTokenParams, getSwapTokenQuotation, getSwapTokenTokenList } from './swap-token';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('Stargate SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    logics.stargate.SwapTokenLogic.supportedChainIds.forEach((chainId) => {
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
        input: { token: logics.stargate.mainnetTokens.STG, amount: '1' },
        tokenOut: logics.stargate.optimismTokens.STG,
        receiver: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
      },
      {
        input: { token: logics.stargate.mainnetTokens.ETH, amount: '1' },
        tokenOut: logics.stargate.optimismTokens.ETH,
        receiver: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
      },
      {
        input: { token: logics.stargate.mainnetTokens.USDC, amount: '1' },
        tokenOut: logics.stargate.optimismTokens['USDC.e'],
        receiver: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getSwapTokenQuotation(chainId, params);
        expect(quotation).to.include.all.keys('input', 'output', 'fee', 'feeBps', 'receiver');
      });
    });
  });
});
