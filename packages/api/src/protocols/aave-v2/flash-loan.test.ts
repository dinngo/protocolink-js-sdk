import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getFlashLoanTokenList } from './flash-loan';
import * as logics from '@protocolink/logics';

describe('AaveV2 FlashLoanLogic', function () {
  context('Test getTokenList', async function () {
    logics.aavev2.FlashLoanLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const tokenList = await getFlashLoanTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });
});
