import { WithdrawBaseParams, getWithdrawBaseQuotation, getWithdrawBaseTokenList } from './withdraw-base';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('CompoundV3 WithdrawBaseLogic', function () {
  context('Test getTokenList', async function () {
    logics.compoundv3.WithdrawBaseLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const tokenList = await getWithdrawBaseTokenList(chainId);
        const marketIds = Object.keys(tokenList);
        expect(marketIds).to.have.lengthOf.above(0);
        for (const marketId of marketIds) {
          expect(tokenList[marketId]).to.have.lengthOf.above(0);
        }
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.mainnet;

    const testCases: WithdrawBaseParams[] = [
      {
        marketId: logics.compoundv3.MarketId.USDC,
        input: { token: logics.compoundv3.mainnetTokens.cUSDCv3, amount: '1' },
        tokenOut: logics.compoundv3.mainnetTokens.USDC,
      },
      {
        marketId: logics.compoundv3.MarketId.ETH,
        input: { token: logics.compoundv3.mainnetTokens.cWETHv3, amount: '1' },
        tokenOut: logics.compoundv3.mainnetTokens.ETH,
      },
      {
        marketId: logics.compoundv3.MarketId.ETH,
        input: { token: logics.compoundv3.mainnetTokens.cWETHv3, amount: '1' },
        tokenOut: logics.compoundv3.mainnetTokens.WETH,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getWithdrawBaseQuotation(chainId, params);
        expect(quotation).to.include.all.keys('marketId', 'input', 'output');
      });
    });
  });
});
