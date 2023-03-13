import * as common from '@composable-router/common';
import * as helpers from '@nomicfoundation/hardhat-network-helpers';

export const faucetMap: Record<number, string> = {
  1: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
};

export async function claimToken(
  chainId: number,
  recepient: string,
  tokenOrAddress: common.TokenOrAddress,
  amount: string
) {
  const hre = await import('hardhat');
  const faucet = faucetMap[chainId];
  await helpers.impersonateAccount(faucet);
  const signer = await hre.ethers.provider.getSigner(faucet);
  const token = await common.tokenOrAddressToToken(chainId, tokenOrAddress, hre.ethers.provider);
  const tokenAmount = new common.TokenAmount(token, amount);

  if (token.isNative()) {
    await signer.sendTransaction({ to: recepient, value: tokenAmount.amountWei });
  } else {
    if (token.isWrapped()) {
      const weth = common.WETH__factory.connect(token.address, signer);
      await (await weth.deposit({ value: tokenAmount.amountWei })).wait();
    }
    const erc20 = common.ERC20__factory.connect(token.address, signer);
    await (await erc20.transfer(recepient, tokenAmount.amountWei)).wait();
  }
}
