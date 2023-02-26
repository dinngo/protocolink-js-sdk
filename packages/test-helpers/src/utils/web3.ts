import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as common from '@composable-router/common';
import { constants, providers } from 'ethers';
import { expect } from 'chai';
import { getChainId } from './network';

export async function getBalance(
  account: string,
  tokenOrAddress: common.TokenOrAddress,
  blockTag?: providers.BlockTag
) {
  const hre = await import('hardhat');
  const chainId = await getChainId();
  const token = await common.tokenOrAddressToToken(chainId, tokenOrAddress, hre.ethers.provider);

  const balanceWei = token.isNative()
    ? await hre.ethers.provider.getBalance(account, blockTag)
    : await common.ERC20__factory.connect(token.address, hre.ethers.provider).balanceOf(account, { blockTag });

  const balance = new common.TokenAmount(token).setWei(balanceWei);

  return balance;
}

export async function approve(user: SignerWithAddress, spender: string, tokenAmount: common.TokenAmount) {
  if (tokenAmount.token.isNative()) return;

  const erc20 = common.ERC20__factory.connect(tokenAmount.token.address, user);
  const allowance = await erc20.allowance(user.address, spender);
  if (allowance.gte(tokenAmount.amountWei)) return;
  await expect(erc20.approve(spender, constants.MaxUint256)).not.to.be.reverted;
}

export async function approves(user: SignerWithAddress, spender: string, tokenAmounts: common.TokenAmounts) {
  return Promise.all(tokenAmounts.map((tokenAmount) => approve(user, spender, tokenAmount)));
}
