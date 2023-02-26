import { ChainId } from '../networks';
import { ELASTIC_ADDRESS } from './constants';
import { expect } from 'chai';
import { mainnetTokens } from 'test/fixtures/tokens';
import { tokenOrAddressToToken } from './utils';

describe('Test tokenOrAddressToToken', function () {
  const testCases = [
    { chainId: ChainId.mainnet, tokenOrAddress: mainnetTokens.ETH, expected: mainnetTokens.ETH },
    { chainId: ChainId.mainnet, tokenOrAddress: mainnetTokens.ETH.toObject(), expected: mainnetTokens.ETH },
    { chainId: ChainId.mainnet, tokenOrAddress: mainnetTokens.ETH.address, expected: mainnetTokens.ETH },
    { chainId: ChainId.mainnet, tokenOrAddress: ELASTIC_ADDRESS, expected: mainnetTokens.ETH },
  ];

  testCases.forEach(({ chainId, tokenOrAddress, expected }, i) => {
    it(`case ${i + 1}`, async function () {
      const token = await tokenOrAddressToToken(chainId, tokenOrAddress);
      expect(JSON.stringify(token)).to.eq(JSON.stringify(expected));
    });
  });
});
