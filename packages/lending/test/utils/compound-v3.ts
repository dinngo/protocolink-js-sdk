import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

export async function supply(
  chainId: number,
  user: SignerWithAddress,
  marketId: string,
  supplyAmount: common.TokenAmount
) {
  const market = logics.compoundv3.getMarket(chainId, marketId);
  await approve(user, market.cometAddress, supplyAmount);
  await expect(
    logics.compoundv3.Comet__factory.connect(market.cometAddress, user).supply(
      supplyAmount.token.address,
      supplyAmount.amountWei
    )
  ).to.not.be.reverted;
}

export async function borrow(
  chainId: number,
  user: SignerWithAddress,
  marketId: string,
  borrowAmount: common.TokenAmount
) {
  const market = logics.compoundv3.getMarket(chainId, marketId);
  await expect(
    logics.compoundv3.Comet__factory.connect(market.cometAddress, user).withdraw(
      borrowAmount.token.address,
      borrowAmount.amountWei
    )
  ).to.not.be.reverted;
}
