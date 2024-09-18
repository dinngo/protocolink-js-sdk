import { DepositParams, getDepositQuotation, getDepositTokenList } from './deposit';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('Iolend DepositLogic', function () {
  context('Test getTokenList', async function () {
    logics.iolend.DepositLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getDepositTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.iota;

    const testCases: DepositParams[] = [
      {
        input: { token: common.iotaTokens.IOTA, amount: '1' },
        tokenOut: logics.iolend.iotaTokens.iWIOTA,
      },
      {
        input: { token: common.iotaTokens.USDT, amount: '1' },
        tokenOut: logics.iolend.iotaTokens.iUSDT,
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
