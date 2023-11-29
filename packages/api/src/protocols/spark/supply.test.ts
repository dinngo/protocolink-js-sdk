import { SupplyParams, getSupplyQuotation, getSupplyTokenList } from './supply';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('Spark SupplyLogic', function () {
  context('Test getTokenList', async function () {
    logics.spark.SupplyLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getSupplyTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.mainnet;

    const testCases: SupplyParams[] = [
      {
        input: { token: logics.spark.mainnetTokens.ETH, amount: '1' },
        tokenOut: logics.spark.mainnetTokens.spWETH,
      },
      {
        input: { token: logics.spark.mainnetTokens.USDC, amount: '1' },
        tokenOut: logics.spark.mainnetTokens.spUSDC,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getSupplyQuotation(chainId, params);
        expect(quotation).to.include.all.keys('input', 'output');
      });
    });
  });
});
