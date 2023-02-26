import { ChainId } from './networks';
import { ELASTIC_ADDRESS } from './tokens';
import { Web3Toolkit } from './web3-toolkit';
import { expect } from 'chai';
import { mainnetTokens } from 'test/fixtures/tokens';

describe('Web3Toolkit', function () {
  const chainId = ChainId.mainnet;
  const web3Toolkit = new Web3Toolkit(chainId);

  context('Test getToken', function () {
    const testCases = [
      { tokenAddress: mainnetTokens.ETH.address, expected: mainnetTokens.ETH },
      { tokenAddress: ELASTIC_ADDRESS, expected: mainnetTokens.ETH },
      { tokenAddress: mainnetTokens.USDC.address, expected: mainnetTokens.USDC },
      { tokenAddress: mainnetTokens.WETH.address, expected: mainnetTokens.WETH },
      { tokenAddress: mainnetTokens.MKR.address, expected: mainnetTokens.MKR },
    ];

    testCases.forEach(({ tokenAddress, expected }) => {
      it(`${expected.symbol}`, async function () {
        const token = await web3Toolkit.getToken(tokenAddress);
        expect(JSON.stringify(token)).to.eq(JSON.stringify(expected));
      });
    });
  });

  context('Test getTokens', function () {
    const testCases = [
      {
        tokenAddresses: [
          mainnetTokens.USDC.address,
          mainnetTokens.ETH.address,
          mainnetTokens.WETH.address,
          ELASTIC_ADDRESS,
          mainnetTokens.DAI.address,
        ],
        expected: [mainnetTokens.USDC, mainnetTokens.ETH, mainnetTokens.WETH, mainnetTokens.ETH, mainnetTokens.DAI],
      },
    ];

    testCases.forEach(({ tokenAddresses, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        const tokens = await web3Toolkit.getTokens(tokenAddresses);
        expect(JSON.stringify(tokens)).to.eq(JSON.stringify(expected));
      });
    });
  });
});
