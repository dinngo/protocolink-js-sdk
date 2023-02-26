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

describe('Token', function () {
  context('Test new instance', function () {
    it('args', function () {
      const chainId = 1;
      const address = '0x0000000000000000000000000000000000000000';
      const decimals = 18;
      const symbol = 'ETH';
      const name = 'Ethereum';
      const token = new Token(chainId, address, decimals, symbol, name);
      expect(token.chainId).to.eq(chainId);
      expect(token.address).to.eq(address);
      expect(token.decimals).to.eq(decimals);
      expect(token.symbol).to.eq(symbol);
      expect(token.name).to.eq(name);
    });

    it('TokenObject', function () {
      const tokenObject = {
        chainId: 1,
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        symbol: 'ETH',
        name: 'Ethereum',
      };
      const token = new Token(tokenObject);
      expect(token.chainId).to.eq(tokenObject.chainId);
      expect(token.address).to.eq(tokenObject.address);
      expect(token.decimals).to.eq(tokenObject.decimals);
      expect(token.symbol).to.eq(tokenObject.symbol);
      expect(token.name).to.eq(tokenObject.name);
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
        expect(token.isNative()).to.eq(expected);
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
        expect(token.isWrapped()).to.eq(expected);
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
        expect(JSON.stringify(token.wrapped())).to.eq(JSON.stringify(expected));
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
