import { ChainId, toNetworkId } from './networks';
import { ELASTIC_ADDRESS } from './tokens';
import { Web3Toolkit } from './web3-toolkit';
import { expect } from 'chai';
import { mainnetTokens } from 'test/fixtures/tokens';

describe('Web3Toolkit', function () {
  context('Test getToken', function () {
    const testCases = [
      {
        chainId: ChainId.mainnet,
        tokenAddress: mainnetTokens.ETH.address,
        expected: mainnetTokens.ETH,
      },
      {
        chainId: ChainId.mainnet,
        tokenAddress: ELASTIC_ADDRESS,
        expected: mainnetTokens.ETH,
      },
      {
        chainId: ChainId.mainnet,
        tokenAddress: mainnetTokens.USDC.address,
        expected: mainnetTokens.USDC,
      },
      {
        chainId: ChainId.mainnet,
        tokenAddress: mainnetTokens.WETH.address,
        expected: mainnetTokens.WETH,
      },
      {
        chainId: ChainId.mainnet,
        tokenAddress: mainnetTokens.MKR.address,
        expected: mainnetTokens.MKR,
      },
      {
        chainId: ChainId.zksync,
        tokenAddress: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
        expected: {
          chainId: ChainId.zksync,
          address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
          decimals: 6,
          symbol: 'USDC.e',
          name: 'Bridged USDC (zkSync)',
        },
      },
    ];

    testCases.forEach(({ chainId, tokenAddress, expected }) => {
      it(`${toNetworkId(chainId)}: ${expected.symbol}`, async function () {
        const web3Toolkit = new Web3Toolkit(chainId);
        const token = await web3Toolkit.getToken(tokenAddress);
        expect(JSON.stringify(token)).to.eq(JSON.stringify(expected));
      });
    });
  });

  context('Test getTokens', function () {
    const testCases = [
      {
        chainId: ChainId.mainnet,
        tokenAddresses: [
          mainnetTokens.USDC.address,
          mainnetTokens.ETH.address,
          mainnetTokens.WETH.address,
          ELASTIC_ADDRESS,
          mainnetTokens.DAI.address,
        ],
        expected: [mainnetTokens.USDC, mainnetTokens.ETH, mainnetTokens.WETH, mainnetTokens.ETH, mainnetTokens.DAI],
      },
      {
        chainId: ChainId.zksync,
        tokenAddresses: ['0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', '0xc2B13Bb90E33F1E191b8aA8F44Ce11534D5698E3'],
        expected: [
          {
            chainId: ChainId.zksync,
            address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            decimals: 6,
            symbol: 'USDC.e',
            name: 'Bridged USDC (zkSync)',
          },
          {
            chainId: ChainId.zksync,
            address: '0xc2B13Bb90E33F1E191b8aA8F44Ce11534D5698E3',
            decimals: 18,
            symbol: 'COMBO',
            name: 'Furucombo',
          },
        ],
      },
    ];

    testCases.forEach(({ chainId, tokenAddresses, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        const web3Toolkit = new Web3Toolkit(chainId);
        const tokens = await web3Toolkit.getTokens(tokenAddresses);
        expect(JSON.stringify(tokens)).to.eq(JSON.stringify(expected));
      });
    });
  });
});
