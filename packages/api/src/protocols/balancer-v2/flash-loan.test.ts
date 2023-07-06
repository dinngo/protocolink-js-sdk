import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getFlashLoanTokenList } from './flash-loan';
import * as logics from '@protocolink/logics';

describe('BalancerV2 FlashLoanLogic', function () {
  context('Test getTokenList', async function () {
    logics.balancerv2.FlashLoanLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getFlashLoanTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });
});
