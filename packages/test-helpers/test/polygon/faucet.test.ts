import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken } from 'src/utils/faucet';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getChainId } from 'src/utils/network';
import hre from 'hardhat';
import { snapshotAndRevertEach } from 'src/hooks';

describe('polygon: Test faucet claim', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    [, user] = await hre.ethers.getSigners();
    chainId = await getChainId();
  });

  snapshotAndRevertEach();

  const testCases: { tokenOrAddress: common.TokenOrAddress; amount: string }[] = [
    { tokenOrAddress: common.polygonTokens.POL, amount: '1' },
    { tokenOrAddress: common.polygonTokens.WPOL, amount: '1' },
    { tokenOrAddress: common.polygonTokens.WETH, amount: '1' },
    { tokenOrAddress: common.polygonTokens['USDC.e'], amount: '1' },
    { tokenOrAddress: common.polygonTokens.WBTC, amount: '1' },
  ];

  testCases.forEach(({ tokenOrAddress, amount }) => {
    it(`claim ${common.isTokenTypes(tokenOrAddress) ? tokenOrAddress.symbol : tokenOrAddress}`, async function () {
      await claimToken(chainId, user.address, tokenOrAddress, amount);
      await expect(user.address).to.changeBalance(tokenOrAddress, amount);
    });
  });
});
