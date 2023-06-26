import { ClaimParams, getClaimQuotation, getClaimTokenList } from './claim';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('CompoundV3 ClaimLogic', function () {
  context('Test getTokenList', async function () {
    logics.compoundv3.ClaimLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const tokenList = await getClaimTokenList(chainId);
        expect(tokenList.length).to.eq(1);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.mainnet;

    const testCases: ClaimParams[] = [
      {
        marketId: logics.compoundv3.MarketId.USDC,
        owner: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
      },
      {
        marketId: logics.compoundv3.MarketId.ETH,
        owner: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getClaimQuotation(chainId, params);
        expect(quotation).to.include.all.keys('marketId', 'owner', 'output');
      });
    });
  });
});
