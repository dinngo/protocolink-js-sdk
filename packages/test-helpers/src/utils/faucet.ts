import * as common from '@composable-router/common';
import * as helpers from '@nomicfoundation/hardhat-network-helpers';

export const faucetMap: Record<number, { default: string; specified: Record<string, string> }> = {
  1: {
    default: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
    specified: {
      '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704': '0xFA11D91e74fdD98F79E01582B9664143E1036931', // cbETH
      '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0': '0x5fEC2f34D80ED82370F733043B6A536d7e9D7f8d', // wstETH
    },
  },
};

export async function claimToken(
  chainId: number,
  recepient: string,
  tokenOrAddress: common.TokenOrAddress,
  amount: string
) {
  const hre = await import('hardhat');
  const token = await common.tokenOrAddressToToken(chainId, tokenOrAddress, hre.ethers.provider);
  const tokenAmount = new common.TokenAmount(token, amount);

  const faucet = faucetMap[chainId]?.specified?.[token.address] ?? faucetMap[chainId].default;
  await helpers.impersonateAccount(faucet);
  const signer = await hre.ethers.provider.getSigner(faucet);
  if (token.isNative) {
    await signer.sendTransaction({ to: recepient, value: tokenAmount.amountWei });
  } else {
    if (token.isWrapped) {
      const weth = common.WETH__factory.connect(token.address, signer);
      await (await weth.deposit({ value: tokenAmount.amountWei })).wait();
    }
    const erc20 = common.ERC20__factory.connect(token.address, signer);
    await (await erc20.transfer(recepient, tokenAmount.amountWei)).wait();
  }
}
