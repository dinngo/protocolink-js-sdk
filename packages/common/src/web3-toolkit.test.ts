import { ChainId, toNetworkId } from './networks';
import { ELASTIC_ADDRESS, mainnetTokens, zksyncTokens } from './tokens';
import { Web3Toolkit } from './web3-toolkit';
import { expect } from 'chai';
import omit from 'lodash/omit';

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
        tokenAddress: zksyncTokens.USDT.address,
        expected: zksyncTokens.USDT,
      },
    ];

    testCases.forEach(({ chainId, tokenAddress, expected }) => {
      it(`${toNetworkId(chainId)}: ${expected.symbol}`, async function () {
        const web3Toolkit = new Web3Toolkit(chainId);
        const token = await web3Toolkit.getToken(tokenAddress);

        expect(JSON.stringify(omit(token, 'logoUri'))).to.eq(JSON.stringify(omit(expected, 'logoUri')));
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
        tokenAddresses: [zksyncTokens.WBTC.address, zksyncTokens.USDT.address],
        expected: [zksyncTokens.WBTC, zksyncTokens.USDT],
      },
    ];

    testCases.forEach(({ chainId, tokenAddresses, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        const web3Toolkit = new Web3Toolkit(chainId);
        const tokens = await web3Toolkit.getTokens(tokenAddresses);

        for (let i = 0; i < tokens.length; i++) {
          expect(JSON.stringify(omit(tokens[i], 'logoUri'))).to.eq(JSON.stringify(omit(expected[i], 'logoUri')));
        }
      });
    });
  });
});
