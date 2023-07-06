import { SupplyParams, getSupplyQuotation, getSupplyTokenList } from './supply';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('AaveV3 SupplyLogic', function () {
  context('Test getTokenList', async function () {
    logics.aavev3.SupplyLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getSupplyTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.mainnet;

    const testCases: SupplyParams[] = [
      {
        input: { token: logics.aavev3.mainnetTokens.ETH, amount: '1' },
        tokenOut: logics.aavev3.mainnetTokens.aEthWETH,
      },
      {
        input: { token: logics.aavev3.mainnetTokens.USDC, amount: '1' },
        tokenOut: logics.aavev3.mainnetTokens.aEthUSDC,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getSupplyQuotation(chainId, params);
        expect(quotation).to.include.all.keys('input', 'output');
      });
    });
  });
});
