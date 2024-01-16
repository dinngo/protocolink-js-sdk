import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getBorrowTokenList } from './borrow';
import * as logics from '@protocolink/logics';

describe('Morphoblue BorrowLogic', function () {
  context('Test getTokenList', async function () {
    logics.morphoblue.BorrowLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getBorrowTokenList(chainId);
        const marketIds = Object.keys(tokenList);
        expect(marketIds).to.have.lengthOf.above(0);
        for (const marketId of marketIds) {
          expect(tokenList[marketId]).to.have.lengthOf.above(0);
        }
      });
    });
  });
});
