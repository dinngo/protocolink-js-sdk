import { WithdrawParams, getWithdrawQuotation, getWithdrawTokenList } from './withdraw';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('AaveV2 WithdrawLogic', function () {
  context('Test getTokenList', async function () {
    logics.aavev2.WithdrawLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const tokenList = await getWithdrawTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.mainnet;

    const testCases: WithdrawParams[] = [
      {
        input: { token: logics.aavev2.mainnetTokens.aWETH, amount: '1' },
        tokenOut: logics.aavev2.mainnetTokens.ETH,
      },
      {
        input: { token: logics.aavev2.mainnetTokens.aUSDC, amount: '1' },
        tokenOut: logics.aavev2.mainnetTokens.USDC,
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
