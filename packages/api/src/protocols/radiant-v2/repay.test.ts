import { RepayParams, getRepayQuotation, getRepayTokenList } from './repay';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';
import { mainnetTokens } from '@protocolink/test-helpers';

describe('RadiantV2 RepayLogic', function () {
  context('Test getTokenList', async function () {
    logics.radiantv2.RepayLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
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
        interestRateMode: logics.radiantv2.InterestRateMode.variable,
        tokenIn: mainnetTokens.ETH,
      },
      {
        borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        interestRateMode: logics.radiantv2.InterestRateMode.variable,
        tokenIn: mainnetTokens.USDC,
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
