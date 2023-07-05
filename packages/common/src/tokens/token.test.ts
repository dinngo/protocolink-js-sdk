import { ELASTIC_ADDRESS } from './constants';
import { Token, isTokenObject } from './token';
import { expect } from 'chai';
import { mainnetTokens } from 'test/fixtures/tokens';

describe('Test isTokenObject', function () {
  const testCases = [
    { token: mainnetTokens.ETH, expected: false },
    { token: mainnetTokens.ETH.toObject(), expected: true },
  ];

  testCases.forEach(({ token, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(isTokenObject(token)).to.eq(expected);
    });
  });
});

describe('Token class', function () {
  context('Test isNative', function () {
    const testCases = [
      { actual: Token.isNative(mainnetTokens.ETH), expected: true },
      { actual: Token.isNative(mainnetTokens.ETH.toObject()), expected: true },
      { actual: Token.isNative(mainnetTokens.ETH.chainId, mainnetTokens.ETH.address), expected: true },
      { actual: Token.isNative(mainnetTokens.WETH), expected: false },
      { actual: Token.isNative(mainnetTokens.WETH.toObject()), expected: false },
      { actual: Token.isNative(mainnetTokens.WETH.chainId, mainnetTokens.WETH.address), expected: false },
    ];

    testCases.forEach(({ actual, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(actual).to.eq(expected);
      });
    });
  });

  context('Test isWrapped', function () {
    const testCases = [
      { actual: Token.isWrapped(mainnetTokens.ETH), expected: false },
      { actual: Token.isWrapped(mainnetTokens.ETH.toObject()), expected: false },
      { actual: Token.isWrapped(mainnetTokens.ETH.chainId, mainnetTokens.ETH.address), expected: false },
      { actual: Token.isWrapped(mainnetTokens.WETH), expected: true },
      { actual: Token.isWrapped(mainnetTokens.WETH.toObject()), expected: true },
      { actual: Token.isWrapped(mainnetTokens.WETH.chainId, mainnetTokens.WETH.address), expected: true },
      {
        actual: Token.isWrapped(mainnetTokens.WETH.chainId, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
        expected: true,
      },
    ];

    testCases.forEach(({ actual, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(actual).to.eq(expected);
      });
    });
  });

  context('Test isWrapped', function () {
    const testCases = [
      {
        address: Token.getAddress(mainnetTokens.ETH),
        expected: '0x0000000000000000000000000000000000000000',
      },
      {
        address: Token.getAddress(mainnetTokens.ETH.toObject()),
        expected: '0x0000000000000000000000000000000000000000',
      },
      {
        address: Token.getAddress(mainnetTokens.ETH.address),
        expected: '0x0000000000000000000000000000000000000000',
      },
      {
        address: Token.getAddress(mainnetTokens.WETH),
        expected: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      },
      {
        address: Token.getAddress(mainnetTokens.WETH.toObject()),
        expected: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      },
      {
        address: Token.getAddress(mainnetTokens.WETH.address),
        expected: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      },
      {
        address: Token.getAddress('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
        expected: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      },
    ];

    testCases.forEach(({ address, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(address).to.eq(expected);
      });
    });
  });
});

describe('Token instance', function () {
  context('Test new instance', function () {
    const testCases = [
      {
        tokenObject: {
          chainId: 1,
          address: '0x0000000000000000000000000000000000000000',
          decimals: 18,
          symbol: 'ETH',
          name: 'Ethereum',
        },
        expectedAddress: '0x0000000000000000000000000000000000000000',
      },
      {
        tokenObject: {
          chainId: 324,
          address: '0xc2b13bb90e33f1e191b8aa8f44ce11534d5698e3',
          decimals: 18,
          symbol: 'COMBO',
          name: 'Furucombo',
        },
        expectedAddress: '0xc2B13Bb90E33F1E191b8aA8F44Ce11534D5698E3',
      },
    ];

    testCases.forEach(({ tokenObject, expectedAddress }, i) => {
      it(`case ${i + 1}`, function () {
        const token = new Token(
          tokenObject.chainId,
          tokenObject.address,
          tokenObject.decimals,
          tokenObject.symbol,
          tokenObject.name
        );
        expect(token.chainId).to.eq(tokenObject.chainId);
        expect(token.address).to.eq(expectedAddress);
        expect(token.decimals).to.eq(tokenObject.decimals);
        expect(token.symbol).to.eq(tokenObject.symbol);
        expect(token.name).to.eq(tokenObject.name);

        const tokenByObject = new Token(tokenObject);
        expect(tokenByObject.chainId).to.eq(tokenObject.chainId);
        expect(tokenByObject.address).to.eq(expectedAddress);
        expect(tokenByObject.decimals).to.eq(tokenObject.decimals);
        expect(tokenByObject.symbol).to.eq(tokenObject.symbol);
        expect(tokenByObject.name).to.eq(tokenObject.name);
      });
    });
  });

  context('Test isNative', function () {
    const testCases = [
      {
        token: mainnetTokens.ETH,
        expected: true,
      },
      {
        token: mainnetTokens.WETH,
        expected: false,
      },
      {
        token: mainnetTokens.USDC,
        expected: false,
      },
    ];

    testCases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(token.isNative).to.eq(expected);
      });
    });
  });

  context('Test isWrapped', function () {
    const testCases = [
      {
        token: mainnetTokens.ETH,
        expected: false,
      },
      {
        token: mainnetTokens.WETH,
        expected: true,
      },
      {
        token: mainnetTokens.USDC,
        expected: false,
      },
    ];

    testCases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(token.isWrapped).to.eq(expected);
      });
    });
  });

  context('Test wrapped', function () {
    const testCases = [
      {
        token: mainnetTokens.ETH,
        expected: mainnetTokens.WETH,
      },
      {
        token: mainnetTokens.WETH,
        expected: mainnetTokens.WETH,
      },
      {
        token: mainnetTokens.USDC,
        expected: mainnetTokens.USDC,
      },
    ];

    testCases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(JSON.stringify(token.wrapped)).to.eq(JSON.stringify(expected));
      });
    });
  });

  context('Test unwrapped', function () {
    const testCases = [
      {
        token: mainnetTokens.WETH,
        expected: mainnetTokens.ETH,
      },
      {
        token: mainnetTokens.ETH,
        expected: mainnetTokens.ETH,
      },
      {
        token: mainnetTokens.USDC,
        expected: mainnetTokens.USDC,
      },
    ];

    testCases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(JSON.stringify(token.unwrapped)).to.eq(JSON.stringify(expected));
      });
    });
  });

  context('Test elasticAddress', function () {
    const testCases = [
      {
        token: mainnetTokens.ETH,
        expected: ELASTIC_ADDRESS,
      },
      {
        token: mainnetTokens.WETH,
        expected: mainnetTokens.WETH.address,
      },
      {
        token: mainnetTokens.USDC,
        expected: mainnetTokens.USDC.address,
      },
    ];

    testCases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(token.elasticAddress).to.deep.eq(expected);
      });
    });
  });

  context('Test sortsBefore', function () {
    const testCases = [
      {
        token0: mainnetTokens.ETH,
        token1: mainnetTokens.USDC,
        expected: false,
      },
      {
        token0: mainnetTokens.USDC,
        token1: mainnetTokens.ETH,
        expected: true,
      },
      {
        token0: mainnetTokens.WETH,
        token1: mainnetTokens.USDC,
        expected: false,
      },
      {
        token0: mainnetTokens.USDC,
        token1: mainnetTokens.WETH,
        expected: true,
      },
      {
        token0: mainnetTokens.DAI,
        token1: mainnetTokens.USDC,
        expected: true,
      },
      {
        token0: mainnetTokens.USDC,
        token1: mainnetTokens.DAI,
        expected: false,
      },
    ];

    testCases.forEach(({ token0, token1, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(token0.sortsBefore(token1)).to.eq(expected);
      });
    });
  });

  context('Test toObject', function () {
    const testCases = [
      {
        token: mainnetTokens.ETH,
        expected: {
          chainId: 1,
          address: '0x0000000000000000000000000000000000000000',
          decimals: 18,
          symbol: 'ETH',
          name: 'Ethereum',
        },
      },
      {
        token: mainnetTokens.USDC,
        expected: {
          chainId: 1,
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          decimals: 6,
          symbol: 'USDC',
          name: 'USD Coin',
        },
      },
    ];

    testCases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(token.toObject()).to.deep.eq(expected);
      });
    });
  });

  context('Test JSON.stringify(token)', function () {
    const testCases = [
      {
        token: mainnetTokens.ETH,
        expected:
          '{"chainId":1,"address":"0x0000000000000000000000000000000000000000","decimals":18,"symbol":"ETH","name":"Ethereum"}',
      },
      {
        token: mainnetTokens.USDC,
        expected:
          '{"chainId":1,"address":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","decimals":6,"symbol":"USDC","name":"USD Coin"}',
      },
    ];

    testCases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(JSON.stringify(token)).to.eq(expected);
      });
    });
  });
});
