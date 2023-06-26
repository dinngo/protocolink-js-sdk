import { RepayParams, getRepayQuotation, getRepayTokenList } from './repay';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('CompoundV3 RepayLogic', function () {
  context('Test getTokenList', async function () {
    logics.compoundv3.RepayLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const tokenList = await getRepayTokenList(chainId);
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

    const testCases: RepayParams[] = [
      {
        marketId: logics.compoundv3.MarketId.USDC,
        borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        tokenIn: logics.compoundv3.mainnetTokens.USDC,
      },
      {
        marketId: logics.compoundv3.MarketId.ETH,
        borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        tokenIn: logics.compoundv3.mainnetTokens.ETH,
      },
      {
        marketId: logics.compoundv3.MarketId.ETH,
        borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        tokenIn: logics.compoundv3.mainnetTokens.WETH,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getRepayQuotation(chainId, params);
        expect(quotation).to.include.all.keys('marketId', 'borrower', 'input');
      });
    });
  });
});
