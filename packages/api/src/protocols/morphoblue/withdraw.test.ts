import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getWithdrawTokenList } from './withdraw';
import * as logics from '@protocolink/logics';

describe('Morpho WithdrawLogic', function () {
  context('Test getTokenList', async function () {
    logics.morphoblue.WithdrawLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getWithdrawTokenList(chainId);
        const marketIds = Object.keys(tokenList);
        expect(marketIds).to.have.lengthOf.above(0);
        for (const marketId of marketIds) {
          expect(tokenList[marketId]).to.have.lengthOf.above(0);
        }
      });
    });
  });
});
