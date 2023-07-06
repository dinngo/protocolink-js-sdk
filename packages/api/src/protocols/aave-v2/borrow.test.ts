import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getBorrowTokenList } from './borrow';
import * as logics from '@protocolink/logics';

describe('AaveV2 BorrowLogic', function () {
  context('Test getTokenList', async function () {
    logics.aavev2.BorrowLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getBorrowTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });
});
