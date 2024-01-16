import { WithdrawParams, getWithdrawQuotation, getWithdrawTokenList } from './withdraw';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';
import { mainnetTokens } from '@protocolink/test-helpers';

describe('RadiantV2 WithdrawLogic', function () {
  context('Test getTokenList', async function () {
    logics.radiantv2.WithdrawLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getWithdrawTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.mainnet;

    const testCases: WithdrawParams[] = [
      {
        input: { token: logics.radiantv2.mainnetTokens.rWETH, amount: '1' },
        tokenOut: mainnetTokens.ETH,
      },
      {
        input: { token: logics.radiantv2.mainnetTokens.rUSDC, amount: '1' },
        tokenOut: mainnetTokens.USDC,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getWithdrawQuotation(chainId, params);
        expect(quotation).to.include.all.keys('input', 'output');
      });
    });
  });
});
