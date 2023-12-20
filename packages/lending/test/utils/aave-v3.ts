import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { defaultInterestRateMode } from 'src/protocol.type';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

export async function supplyAaveV3(
  user: SignerWithAddress,
  lendingPoolAddress: string,
  supplyAmount: common.TokenAmount
) {
  await approve(user, lendingPoolAddress, supplyAmount);
  await expect(
    logics.aavev3.Pool__factory.connect(lendingPoolAddress, user).supply(
      supplyAmount.token.address,
      supplyAmount.amountWei,
      user.address,
      0
    )
  ).to.not.be.reverted;
}

export async function borrowAaveV3(
  user: SignerWithAddress,
  lendingPoolAddress: string,
  borrowAmount: common.TokenAmount
) {
  await expect(
    logics.aavev3.Pool__factory.connect(lendingPoolAddress, user).borrow(
      borrowAmount.token.address,
      borrowAmount.amountWei,
      defaultInterestRateMode,
      0,
      user.address
    )
  ).to.not.be.reverted;
}
