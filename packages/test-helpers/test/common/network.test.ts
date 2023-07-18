import { expect } from 'chai';
import { getChainId } from 'src/utils/network';

describe('common: Network', function () {
  it('Test getChainId', async function () {
    const chainIdFromEnv = Number(process.env.CHAIN_ID);
    expect(chainIdFromEnv).to.be.gt(0);
    const chainId = await getChainId();
    expect(chainId).to.eq(chainIdFromEnv);
  });
});
