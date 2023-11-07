import * as common from '@protocolink/common';
import * as helpers from '@nomicfoundation/hardhat-network-helpers';

export const faucetMap: Record<number, { default: string; specified?: Record<string, string> }> = {
  [common.ChainId.mainnet]: {
    default: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
    specified: {
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', // USDC
      '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704': '0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43', // cbETH
      '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0': '0x5fEC2f34D80ED82370F733043B6A536d7e9D7f8d', // wstETH
    },
  },
  [common.ChainId.polygon]: {
    default: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
    specified: {
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619': '0x1eED63EfBA5f81D95bfe37d82C8E736b974F477b', // WETH
      '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6': '0x0AFF6665bB45bF349489B20E225A6c5D78E2280F', // WBTC
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': '0xe7804c37c13166fF0b37F5aE0BB07A3aEbb6e245', // USDC
    },
  },
  [common.ChainId.arbitrum]: {
    default: '0x489ee077994B6658eAfA855C308275EAd8097C4A',
  },
};

export async function claimToken(
  chainId: number,
  recepient: string,
  tokenOrAddress: common.TokenOrAddress,
  amount: string,
  faucet?: string
) {
  const hre = await import('hardhat');

  const web3Toolkit = new common.Web3Toolkit(chainId, hre.ethers.provider);
  const token = await web3Toolkit.getToken(tokenOrAddress);
  const tokenAmount = new common.TokenAmount(token, amount);

  if (token.isNative || token.isWrapped) {
    const signers = await hre.ethers.getSigners();
    faucet = signers[signers.length - 1].address;
  } else {
    if (!faucet) {
      faucet = faucetMap[chainId]?.specified?.[token.address] ?? faucetMap[chainId].default;
    }
    await helpers.impersonateAccount(faucet);
  }

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
