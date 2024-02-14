import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { defaultInterestRateMode } from 'src/protocol.type';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';

export async function deposit(chainId: number, user: SignerWithAddress, tokenAmount: common.TokenAmount) {
  const service = new logics.radiantv2.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await service.getLendingPoolAddress();
  await approve(user, lendingPoolAddress, tokenAmount);
  await expect(
    logics.radiantv2.LendingPool__factory.connect(lendingPoolAddress, user).deposit(
      tokenAmount.token.address,
      tokenAmount.amountWei,
      user.address,
      0
    )
  ).to.not.be.reverted;
}

export async function borrow(chainId: number, user: SignerWithAddress, tokenAmount: common.TokenAmount) {
  const service = new logics.radiantv2.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await service.getLendingPoolAddress();
  await approve(user, lendingPoolAddress, tokenAmount);
  await expect(
    logics.radiantv2.LendingPool__factory.connect(lendingPoolAddress, user).borrow(
      tokenAmount.token.address,
      tokenAmount.amountWei,
      defaultInterestRateMode,
      0,
      user.address
    )
  ).to.not.be.reverted;
}
