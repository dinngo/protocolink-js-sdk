import { ChainId } from 'src/networks';
import { Token } from './token';
import {
  TokenPairArray,
  TokenPairRecord,
  TokenRecord,
  getCustomTokens,
  getUnifiedTokens,
  unifyTokens,
  unifyTokensByCustomTokens,
} from './utils';
import { expect } from 'chai';

const chainId = ChainId.mainnet;

// the token in custom tokens
const token1 = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'UUUSDC', 'some url');
const token2 = new Token(1, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'UUUSDT', 'some url');

// the token in external tokens
const token3 = new Token(1, '0xa117000000f279d81a1d3cc75430faa017fa5a2e', 18, 'ANT', 'ANT', 'some url');

// the token not in custom token and external token
const token4 = new Token(1, '0x1234512345123451234512345123451234512345', 18, 'FakeToken', 'FakeToken', 'some url');

describe('Test unify tokens', function () {
  let tokensByAddress: Record<string, Token>;

  before(async function () {
    tokensByAddress = await getUnifiedTokens(chainId);
  });

  it('TokenArray - should replace the property if the token is in UnifiedTokens', async function () {
    const tokens = [token1, token2, token3, token4];

    const unifiedTokens = await unifyTokens(chainId, tokens);

    expect(unifiedTokens).to.have.length(4);

    unifiedTokens.forEach((unifiedToken, i) => {
      if (unifiedToken.symbol === 'FakeToken') {
        expect(JSON.stringify(unifiedToken)).equal(JSON.stringify(tokens[i]));
      } else {
        expect(JSON.stringify(unifiedToken)).equal(
          JSON.stringify(tokensByAddress[unifiedToken.address as keyof typeof tokensByAddress])
        );
      }
    });
  });

  it('TokenPairArray - should replace the property if the token is in UnifiedTokens', async function () {
    const tokens: TokenPairArray = [
      [token1, token2],
      [token3, token4],
    ];

    const unifiedTokens = await unifyTokens(chainId, tokens);

    expect(unifiedTokens).to.have.length(2);

    unifiedTokens.forEach((unifiedToken, i) => {
      unifiedToken.forEach((token, j) => {
        if (token.symbol === 'FakeToken') {
          expect(JSON.stringify(token)).equal(JSON.stringify(tokens[i][j]));
        } else {
          expect(JSON.stringify(token)).equal(
            JSON.stringify(tokensByAddress[token.address as keyof typeof tokensByAddress])
          );
        }
      });
    });
  });

  it('TokenRecord - should replace the property if the token is in UnifiedTokens', async function () {
    const tokens: TokenRecord = {
      key12: [token1, token2],
      key34: [token3, token4],
    };

    const unifiedTokens = await unifyTokens(chainId, tokens);

    expect(Object.keys(unifiedTokens)).to.have.length(2);

    Object.keys(unifiedTokens).forEach((key) => {
      unifiedTokens[key].forEach((token, j) => {
        if (token.symbol === 'FakeToken') {
          expect(JSON.stringify(token)).equal(JSON.stringify(tokens[key][j]));
        } else {
          expect(JSON.stringify(token)).equal(
            JSON.stringify(tokensByAddress[token.address as keyof typeof tokensByAddress])
          );
        }
      });
    });
  });

  it('TokenPairRecord - should replace the property if the token is in UnifiedTokens', async function () {
    const tokens: TokenPairRecord = {
      key1234: [
        [token1, token2],
        [token3, token4],
      ],
    };

    const unifiedTokens = await unifyTokens(chainId, tokens);

    expect(Object.keys(unifiedTokens)).to.have.length(1);

    Object.keys(unifiedTokens).forEach((key) => {
      unifiedTokens[key].forEach((tokenPair, i) => {
        tokenPair.forEach((token, j) => {
          if (token.symbol === 'FakeToken') {
            expect(JSON.stringify(token)).equal(JSON.stringify(tokens[key][i][j]));
          } else {
            expect(JSON.stringify(token)).equal(
              JSON.stringify(tokensByAddress[token.address as keyof typeof tokensByAddress])
            );
          }
        });
      });
    });
  });
});

describe('Test unifyTokensByCustomTokens', function () {
  let tokensByAddress: Record<string, Token>;

  before(async function () {
    tokensByAddress = getCustomTokens(chainId);
  });

  it('TokenArray - should replace the property if the token is in custom tokens', function () {
    const tokens = [token1, token2, token3, token4];
    const unifiedTokens = unifyTokensByCustomTokens(chainId, tokens);

    expect(unifiedTokens).to.have.length(4);

    unifiedTokens.forEach((unifiedTokens, i) => {
      if (['FakeToken', 'ANT'].includes(unifiedTokens.symbol)) {
        expect(JSON.stringify(unifiedTokens)).equal(JSON.stringify(tokens[i]));
      } else {
        expect(JSON.stringify(unifiedTokens)).equal(
          JSON.stringify(tokensByAddress[unifiedTokens.address as keyof typeof tokensByAddress])
        );
      }
    });
  });

  it('TokenPairArray - should replace the property if the token is in custom tokens', function () {
    const tokens: TokenPairArray = [
      [token1, token2],
      [token3, token4],
    ];
    const unifiedTokens = unifyTokensByCustomTokens(chainId, tokens);

    expect(unifiedTokens).to.have.length(2);

    unifiedTokens.forEach((unifiedToken, i) => {
      unifiedToken.forEach((token, j) => {
        if (['FakeToken', 'ANT'].includes(token.symbol)) {
          expect(JSON.stringify(token)).equal(JSON.stringify(tokens[i][j]));
        } else {
          expect(JSON.stringify(token)).equal(
            JSON.stringify(tokensByAddress[token.address as keyof typeof tokensByAddress])
          );
        }
      });
    });
  });

  it('TokenRecord - should replace the property if the token is in custom tokens', function () {
    const tokens: TokenRecord = {
      key12: [token1, token2],
      key34: [token3, token4],
    };
    const unifiedTokens = unifyTokensByCustomTokens(chainId, tokens);

    expect(Object.keys(unifiedTokens)).to.have.length(2);

    Object.keys(unifiedTokens).forEach((key) => {
      unifiedTokens[key].forEach((token, j) => {
        if (['FakeToken', 'ANT'].includes(token.symbol)) {
          expect(JSON.stringify(token)).equal(JSON.stringify(tokens[key][j]));
        } else {
          expect(JSON.stringify(token)).equal(
            JSON.stringify(tokensByAddress[token.address as keyof typeof tokensByAddress])
          );
        }
      });
    });
  });

  it('TokenPairRecord - should replace the property if the token is in custom tokens', function () {
    const tokens: TokenPairRecord = {
      key1234: [
        [token1, token2],
        [token3, token4],
      ],
    };
    const unifiedTokens = unifyTokensByCustomTokens(chainId, tokens);

    expect(Object.keys(unifiedTokens)).to.have.length(1);

    Object.keys(unifiedTokens).forEach((key) => {
      unifiedTokens[key].forEach((tokenPair, i) => {
        tokenPair.forEach((token, j) => {
          if (['FakeToken', 'ANT'].includes(token.symbol)) {
            expect(JSON.stringify(token)).equal(JSON.stringify(tokens[key][i][j]));
          } else {
            expect(JSON.stringify(token)).equal(
              JSON.stringify(tokensByAddress[token.address as keyof typeof tokensByAddress])
            );
          }
        });
      });
    });
  });
});
