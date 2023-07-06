import { SupplyBaseParams, getSupplyBaseQuotation, getSupplyBaseTokenList } from './supply-base';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('CompoundV3 SupplyBaseLogic', function () {
  context('Test getTokenList', async function () {
    logics.compoundv3.SupplyBaseLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getSupplyBaseTokenList(chainId);
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

    const testCases: SupplyBaseParams[] = [
      {
        marketId: logics.compoundv3.MarketId.USDC,
        input: { token: logics.compoundv3.mainnetTokens.USDC, amount: '1' },
        tokenOut: logics.compoundv3.mainnetTokens.cUSDCv3,
      },
      {
        marketId: logics.compoundv3.MarketId.ETH,
        input: { token: logics.compoundv3.mainnetTokens.ETH, amount: '1' },
        tokenOut: logics.compoundv3.mainnetTokens.cWETHv3,
      },
      {
        marketId: logics.compoundv3.MarketId.ETH,
        input: { token: logics.compoundv3.mainnetTokens.WETH, amount: '1' },
        tokenOut: logics.compoundv3.mainnetTokens.cWETHv3,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getSupplyBaseQuotation(chainId, params);
        expect(quotation).to.include.all.keys('marketId', 'input', 'output');
      });
    });
  });
});
