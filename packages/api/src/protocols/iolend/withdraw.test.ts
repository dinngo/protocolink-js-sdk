import { WithdrawParams, getWithdrawQuotation, getWithdrawTokenList } from './withdraw';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('Iolend WithdrawLogic', function () {
  context('Test getTokenList', async function () {
    logics.iolend.WithdrawLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getWithdrawTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.iota;

    const testCases: WithdrawParams[] = [
      {
        input: { token: logics.iolend.iotaTokens.iWIOTA, amount: '1' },
        tokenOut: common.iotaTokens.IOTA,
      },
      {
        input: { token: logics.iolend.iotaTokens.iUSDT, amount: '1' },
        tokenOut: common.iotaTokens.USDT,
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
