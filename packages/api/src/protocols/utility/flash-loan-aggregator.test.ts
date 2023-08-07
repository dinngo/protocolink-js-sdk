import {
  FlashLoanAggregatorParams,
  getFlashLoanAggregatorQuotation,
  getFlashLoanAggregatorTokenList,
} from './flash-loan-aggregator';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('Utility FlashLoanAggregatorLogic', function () {
  context('Test getTokenList', async function () {
    logics.utility.FlashLoanAggregatorLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getFlashLoanAggregatorTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.mainnet;

    const testCases: FlashLoanAggregatorParams[] = [
      {
        outputs: [
          { token: logics.aavev2.mainnetTokens.WETH, amount: '1' },
          { token: logics.aavev2.mainnetTokens.USDC, amount: '1' },
        ],
      },
      {
        outputs: [
          { token: logics.aavev2.mainnetTokens.WBTC, amount: '1' },
          { token: logics.aavev2.mainnetTokens.DAI, amount: '1' },
        ],
      },
      {
        outputs: [
          { token: logics.aavev3.mainnetTokens['1INCH'], amount: '1' },
          { token: logics.aavev3.mainnetTokens.AAVE, amount: '1' },
        ],
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getFlashLoanAggregatorQuotation(chainId, params);
        expect(quotation).to.include.all.keys('loans', 'repays', 'fees', 'feeBps');
      });
    });
  });
});
