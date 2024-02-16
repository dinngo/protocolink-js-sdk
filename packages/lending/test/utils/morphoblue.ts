import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';

export async function deposit(
  chainId: number,
  marketId: string,
  user: SignerWithAddress,
  tokenAmount: common.TokenAmount
) {
  const market = logics.morphoblue.getMarket(chainId, marketId);
  const morphoAddress = logics.morphoblue.getContractAddress(chainId, 'Morpho');
  await approve(user, morphoAddress, tokenAmount);
  await expect(
    logics.morphoblue.Morpho__factory.connect(morphoAddress, user).supplyCollateral(
      {
        loanToken: market.loanTokenAddress,
        collateralToken: market.collateralTokenAddress,
        oracle: market.oracle,
        irm: market.irm,
        lltv: market.lltv,
      },
      tokenAmount.amountWei,
      user.address,
      '0x'
    )
  ).to.not.be.reverted;
}

export async function borrow(
  chainId: number,
  marketId: string,
  user: SignerWithAddress,
  tokenAmount: common.TokenAmount
) {
  const market = logics.morphoblue.getMarket(chainId, marketId);
  const morphoAddress = logics.morphoblue.getContractAddress(chainId, 'Morpho');
  await approve(user, morphoAddress, tokenAmount);
  await expect(
    logics.morphoblue.Morpho__factory.connect(morphoAddress, user).borrow(
      {
        loanToken: market.loanTokenAddress,
        collateralToken: market.collateralTokenAddress,
        oracle: market.oracle,
        irm: market.irm,
        lltv: market.lltv,
      },
      tokenAmount.amountWei,
      0,
      user.address,
      user.address
    )
  ).to.not.be.reverted;
}

export async function getCollateralBalance(chainId: number, marketId: string, user: SignerWithAddress) {
  const morphoAddress = logics.morphoblue.getContractAddress(chainId, 'Morpho');
  const position = await logics.morphoblue.Morpho__factory.connect(morphoAddress, user).position(
    marketId,
    user.address
  );
  const service = new logics.morphoblue.Service(chainId, hre.ethers.provider);
  const collateral = await service.getCollateralToken(marketId);
  return new common.TokenAmount(collateral).setWei(position.collateral);
}

export async function getBorrowBalance(chainId: number, marketId: string, borrower: SignerWithAddress) {
  const service = new logics.morphoblue.Service(chainId, hre.ethers.provider);
  const loanToken = await service.getLoanToken(marketId);
  const borrowShares = await service.getBorrowShares(marketId, borrower.address);
  const morphoAddress = logics.morphoblue.getContractAddress(chainId, 'Morpho');
  const { totalBorrowAssets, totalBorrowShares } = await logics.morphoblue.Morpho__factory.connect(
    morphoAddress,
    borrower
  ).market(marketId);
  const borrowBalance = service.toAssetsDown(borrowShares, totalBorrowAssets, totalBorrowShares);
  return new common.TokenAmount(loanToken).setWei(borrowBalance);
}
