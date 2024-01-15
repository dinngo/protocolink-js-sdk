import { FlashLoanParams, getFlashLoanQuotation, getFlashLoanTokenList } from './flash-loan';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';
import { mainnetTokens } from '@protocolink/test-helpers';

describe('RadiantV2 FlashLoanLogic', function () {
  context('Test getTokenList', async function () {
    logics.radiantv2.FlashLoanLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getFlashLoanTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.mainnet;

    const testCases: FlashLoanParams[] = [
      {
        loans: [
          { token: mainnetTokens.WETH, amount: '1' },
          { token: mainnetTokens.USDC, amount: '1' },
        ],
      },
      {
        repays: [
          { token: mainnetTokens.WETH, amount: '1' },
          { token: mainnetTokens.USDC, amount: '1' },
        ],
      },
      {
        loans: [
          { token: mainnetTokens.WBTC, amount: '1' },
          { token: mainnetTokens.USDT, amount: '1' },
        ],
      },
      {
        repays: [
          { token: mainnetTokens.WBTC, amount: '1' },
          { token: mainnetTokens.USDT, amount: '1' },
        ],
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getFlashLoanQuotation(chainId, params);
        expect(quotation).to.include.all.keys('loans', 'repays', 'feeBps');
      });
    });
  });
});
