import { WithdrawParams, getWithdrawQuotation, getWithdrawTokenList } from './withdraw';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('Spark WithdrawLogic', function () {
  context('Test getTokenList', async function () {
    logics.spark.WithdrawLogic.supportedChainIds.forEach((chainId) => {
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
        input: { token: logics.spark.mainnetTokens.spWETH, amount: '1' },
        tokenOut: logics.spark.mainnetTokens.ETH,
      },
      {
        input: { token: logics.spark.mainnetTokens.spUSDC, amount: '1' },
        tokenOut: logics.spark.mainnetTokens.USDC,
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
