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
    { tokenOrAddress: mainnetTokens.USDC.address, amount: '1' },
  ];

  testCases.forEach(({ tokenOrAddress, amount }) => {
    it(`claim ${common.isTokenTypes(tokenOrAddress) ? tokenOrAddress.symbol : tokenOrAddress}`, async function () {
      await claimToken(chainId, user.address, tokenOrAddress, amount);
      await expect(user.address).to.changeBalance(tokenOrAddress, amount);
    });
  });
});
