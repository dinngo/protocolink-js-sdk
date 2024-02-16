import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';

export async function supply(
  chainId: number,
  marketId: string,
  user: SignerWithAddress,
  tokenAmount: common.TokenAmount
) {
  const market = logics.compoundv3.getMarket(chainId, marketId);
  await approve(user, market.cometAddress, tokenAmount);
  await expect(
    logics.compoundv3.Comet__factory.connect(market.cometAddress, user).supply(
      tokenAmount.token.address,
      tokenAmount.amountWei
    )
  ).to.not.be.reverted;
}

export async function borrow(
  chainId: number,
  marketId: string,
  user: SignerWithAddress,
  tokenAmount: common.TokenAmount
) {
  const market = logics.compoundv3.getMarket(chainId, marketId);
  await expect(
    logics.compoundv3.Comet__factory.connect(market.cometAddress, user).withdraw(
      tokenAmount.token.address,
      tokenAmount.amountWei
    )
  ).to.not.be.reverted;
}

export async function getCollateralBalance(chainId: number, marketId: string, user: string, collateral: common.Token) {
  const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
  return await service.getCollateralBalance(marketId, user, collateral);
}

export async function getBorrowBalance(chainId: number, marketId: string, borrowerAddress: string) {
  const market = logics.compoundv3.getMarket(chainId, marketId);
  const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
  const baseToken = await service.getBaseToken(market.id);
  const borrowBalance = await logics.compoundv3.Comet__factory.connect(
    market.cometAddress,
    hre.ethers.provider
  ).borrowBalanceOf(borrowerAddress);
  return new common.TokenAmount(baseToken).setWei(borrowBalance);
}
