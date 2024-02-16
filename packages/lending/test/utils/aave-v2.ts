import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { defaultInterestRateMode } from 'src/protocol.type';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import { mainnetTokens } from 'src/tokens';

export async function deposit(chainId: number, user: SignerWithAddress, tokenAmount: common.TokenAmount) {
  const service = new logics.aavev2.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await service.getLendingPoolAddress();
  await approve(user, lendingPoolAddress, tokenAmount);
  await expect(
    logics.aavev2.LendingPool__factory.connect(lendingPoolAddress, user).deposit(
      tokenAmount.token.address,
      tokenAmount.amountWei,
      user.address,
      0
    )
  ).to.not.be.reverted;
}

export async function borrow(chainId: number, user: SignerWithAddress, tokenAmount: common.TokenAmount) {
  const service = new logics.aavev2.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await service.getLendingPoolAddress();
  await approve(user, lendingPoolAddress, tokenAmount);
  await expect(
    logics.aavev2.LendingPool__factory.connect(lendingPoolAddress, user).borrow(
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
      return '0x619beb58998eD2278e08620f97007e1116D5D25b'; // variableDebtUSDC
    case mainnetTokens.DAI.address:
      return '0x6C3c78838c761c6Ac7bE9F59fe808ea2A6E4379d'; // variableDebtDAI
    default:
      return undefined;
  }
}
