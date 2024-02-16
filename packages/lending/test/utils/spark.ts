import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { defaultInterestRateMode } from 'src/protocol.type';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as spark from 'src/protocols/spark/tokens';

export async function supply(chainId: number, user: SignerWithAddress, tokenAmount: common.TokenAmount) {
  const service = new logics.spark.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await service.getPoolAddress();
  await approve(user, lendingPoolAddress, tokenAmount);
  await expect(
    logics.spark.Pool__factory.connect(lendingPoolAddress, user).supply(
      tokenAmount.token.address,
      tokenAmount.amountWei,
      user.address,
      0
    )
  ).to.not.be.reverted;
}

export async function borrow(chainId: number, user: SignerWithAddress, tokenAmount: common.TokenAmount) {
  const service = new logics.spark.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await service.getPoolAddress();
  await approve(user, lendingPoolAddress, tokenAmount);
  await expect(
    logics.spark.Pool__factory.connect(lendingPoolAddress, user).borrow(
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
    case spark.mainnetTokens.DAI.address:
      return '0xf705d2B7e92B3F38e6ae7afaDAA2fEE110fE5914'; // DAI_variableDebtToken
    case spark.mainnetTokens.wstETH.address:
      return '0xd5c3E3B566a42A6110513Ac7670C1a86D76E13E6'; // wstETH_variableDebtToken
    default:
      return undefined;
  }
}
