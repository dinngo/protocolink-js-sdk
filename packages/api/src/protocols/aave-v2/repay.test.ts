import { RepayParams, getRepayQuotation, getRepayTokenList } from './repay';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('AaveV2 RepayLogic', function () {
  context('Test getTokenList', async function () {
    logics.aavev2.RepayLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const tokenList = await getRepayTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.mainnet;

    const testCases: RepayParams[] = [
      {
        borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        interestRateMode: logics.aavev2.InterestRateMode.variable,
        tokenIn: logics.aavev2.mainnetTokens.ETH,
      },
      {
        borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        interestRateMode: logics.aavev2.InterestRateMode.variable,
        tokenIn: logics.aavev2.mainnetTokens.USDC,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getRepayQuotation(chainId, params);
        expect(quotation).to.include.all.keys('borrower', 'interestRateMode', 'input');
      });
    });
  });
});
