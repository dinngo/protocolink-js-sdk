import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken } from '../src/utils/faucet';
import * as common from '@composable-router/common';
import { expect } from 'chai';
import { getChainId } from '../src/utils/network';
import hre from 'hardhat';
import { mainnetTokens } from 'src';

describe('Test faucet claim', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    [, user] = await hre.ethers.getSigners();
    chainId = await getChainId();
  });

  const testCases: { tokenOrAddress: common.TokenOrAddress; amount: string }[] = [
    { tokenOrAddress: mainnetTokens.ETH, amount: '1' },
    { tokenOrAddress: mainnetTokens.WETH, amount: '1' },
    { tokenOrAddress: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704', amount: '1' }, // cbETH
    { tokenOrAddress: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', amount: '1' }, // wstETH
  ];

  testCases.forEach(({ tokenOrAddress, amount }) => {
    it(`claim ${common.isTokenTypes(tokenOrAddress) ? tokenOrAddress.symbol : tokenOrAddress}`, async function () {
      await claimToken(chainId, user.address, tokenOrAddress, amount);
      await expect(user.address).to.changeBalance(tokenOrAddress, amount);
    });
  });
});
