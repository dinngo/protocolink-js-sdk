import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getSupplyTokenList } from './supply';
import * as logics from '@protocolink/logics';

describe('Morpho SupplyLogic', function () {
  context('Test getTokenList', async function () {
    logics.morphoblue.SupplyLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getSupplyTokenList(chainId);
        const marketIds = Object.keys(tokenList);
        expect(marketIds).to.have.lengthOf.above(0);
        for (const marketId of marketIds) {
          expect(tokenList[marketId]).to.have.lengthOf.above(0);
        }
      });
    });
  });
});
