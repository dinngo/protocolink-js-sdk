import { DepositParams, getDepositQuotation, getDepositTokenList } from './deposit';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';
import { mainnetTokens } from '@protocolink/test-helpers';

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
    const chainId = common.ChainId.mainnet;

    const testCases: DepositParams[] = [
      {
        input: { token: mainnetTokens.ETH, amount: '1' },
        tokenOut: logics.radiantv2.mainnetTokens.rWETH,
      },
      {
        input: { token: mainnetTokens.USDC, amount: '1' },
        tokenOut: logics.radiantv2.mainnetTokens.rUSDC,
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
