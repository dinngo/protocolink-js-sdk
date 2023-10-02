import { DepositParams, getDepositQuotation, getDepositTokenList } from './deposit';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('RadiantV2 DepositLogic', function () {
  context('Test getTokenList', async function () {
    logics.radiantv2.DepositLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getDepositTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.arbitrum;

    const testCases: DepositParams[] = [
      {
        input: { token: logics.radiantv2.arbitrumTokens.ETH, amount: '1' },
        tokenOut: logics.radiantv2.arbitrumTokens.rWETH,
      },
      {
        input: { token: logics.radiantv2.arbitrumTokens.USDC, amount: '1' },
        tokenOut: logics.radiantv2.arbitrumTokens.rUSDC,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getDepositQuotation(chainId, params);
        expect(quotation).to.include.all.keys('input', 'output');
      });
    });
  });
});
