import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { defaultInterestRateMode } from 'src/protocol.type';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import { mainnetTokens } from 'src/tokens';

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

export function toVariableDebtToken(underlyingToken: common.Token) {
  switch (underlyingToken.address) {
    case mainnetTokens.USDC.address:
      return '0x490726291F6434646FEb2eC96d2Cc566b18a122F'; // vdUSDC
    case mainnetTokens.USDT.address:
      return '0x2D4fc0D5421C0d37d325180477ba6e16ae3aBAA7'; // vdUSDT
    default:
      return undefined;
  }
}
