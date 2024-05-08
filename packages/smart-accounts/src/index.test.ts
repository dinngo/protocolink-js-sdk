import { SmartAccountId, getSmartAccount } from '../src/configs';
import * as common from '@protocolink/common';
import { encodeSmartAccount, getSmartAccountIds, isSupportedSmartAccountId } from '../src';
import { expect } from 'chai';
import { utils } from 'ethers';

describe('SmartAccount', function () {
  context('Test getSmartAccountIds()', function () {
    const testCases = [
      {
        chainId: common.ChainId.optimism,
      },
    ];

    testCases.forEach(({ chainId }, i) => {
      it(`case ${i + 1}`, async function () {
        const smartIds = getSmartAccountIds(chainId);
        expect(smartIds).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test verify()', function () {
    const testCases = [
      { chainId: common.ChainId.optimism, id: SmartAccountId.PORTUS, expects: true },
      { chainId: common.ChainId.optimism, id: '999', expects: false },
      { chainId: common.ChainId.mainnet, id: SmartAccountId.PORTUS, expects: false },
    ];

    testCases.forEach(({ chainId, id, expects }, i) => {
      it(`case ${i + 1}`, async function () {
        expect(isSupportedSmartAccountId(chainId, id)).to.be.eq(expects);
      });
    });
  });

  context('Test encode()', function () {
    const testCases = [
      {
        chainId: common.ChainId.optimism,
        id: SmartAccountId.PORTUS,
        tos: ['0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa'],
        datas: ['0x94b918de0517006639e81d00000000004b7ec32d7a20000000000014d23016aeef0053a0'],
        values: ['0'],
      },
    ];

    testCases.forEach(({ chainId, id, tos, datas, values }, i) => {
      it(`case ${i + 1}`, async function () {
        const { to, data } = encodeSmartAccount(chainId, id, tos, datas, values);
        expect(to).to.eq(getSmartAccount(chainId, id).executor);
        expect(utils.isBytesLike(data)).to.be.true;
      });
    });
  });
});
