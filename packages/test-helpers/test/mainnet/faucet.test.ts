import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken } from 'src/utils/faucet';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getChainId } from 'src/utils/network';
import hre from 'hardhat';
import { mainnetTokens } from 'src/fixtures';
import { snapshotAndRevertEach } from 'src/hooks';

describe('mainnet: Test faucet claim', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    [, user] = await hre.ethers.getSigners();
    chainId = await getChainId();
  });

  snapshotAndRevertEach();

  const testCases: { tokenOrAddress: common.TokenOrAddress; amount: string; faucet?: string }[] = [
    { tokenOrAddress: mainnetTokens.ETH, amount: '1' },
    { tokenOrAddress: mainnetTokens.WETH, amount: '1' },
    { tokenOrAddress: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704', amount: '1' }, // cbETH
    { tokenOrAddress: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', amount: '1' }, // wstETH
    { tokenOrAddress: mainnetTokens.COMP, amount: '1', faucet: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B' },
  ];

  testCases.forEach(({ tokenOrAddress, amount, faucet }) => {
    it(`claim ${common.isTokenTypes(tokenOrAddress) ? tokenOrAddress.symbol : tokenOrAddress}${
      faucet ? ' with custom faucet' : ''
    }`, async function () {
      await claimToken(chainId, user.address, tokenOrAddress, amount, faucet);
      await expect(user.address).to.changeBalance(tokenOrAddress, amount);
    });
  });
});
