import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getSendTokenTokenList } from './send-token';
import * as logics from '@protocolink/logics';

describe('Utility SendTokenLogic', function () {
  context('Test getTokenList', async function () {
    logics.utility.SendTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const tokenList = await getSendTokenTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });
});
