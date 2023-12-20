import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { defaultInterestRateMode } from 'src/protocol.type';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

export async function depositAaveV2(
  user: SignerWithAddress,
  lendingPoolAddress: string,
  depositAmount: common.TokenAmount
) {
  depositAmount = new common.TokenAmount(depositAmount.token.wrapped, depositAmount.amount);

  await approve(user, lendingPoolAddress, depositAmount);
  await expect(
    logics.aavev2.LendingPool__factory.connect(lendingPoolAddress, user).deposit(
      depositAmount.token.address,
      depositAmount.amountWei,
      user.address,
      0
    )
  ).to.not.be.reverted;
}

export async function borrowAaveV2(
  user: SignerWithAddress,
  lendingPoolAddress: string,
  borrowAmount: common.TokenAmount
) {
  if (borrowAmount.token.isNative) {
    const wrappedToken = borrowAmount.token.wrapped;
    await expect(common.WETH__factory.connect(wrappedToken.address, user).deposit({ value: borrowAmount.amountWei })).to
      .not.be.reverted;
    borrowAmount = new common.TokenAmount(wrappedToken, borrowAmount.amount);
  }

  await approve(user, lendingPoolAddress, borrowAmount);
  await expect(
    logics.aavev2.LendingPool__factory.connect(lendingPoolAddress, user).borrow(
      borrowAmount.token.address,
      borrowAmount.amountWei,
      defaultInterestRateMode,
      0,
      user.address
    )
  ).to.not.be.reverted;
}
