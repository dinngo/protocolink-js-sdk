import {
  TokenAmount,
  TokenAmountObject,
  TokenAmountPair,
  TokenAmounts,
  isTokenAmount,
  isTokenAmountObject,
} from './token-amount';
import { expect } from 'chai';
import { mainnetTokens } from './utils';

describe('Test isTokenAmountObject', function () {
  const testCases = [
    { tokenAmount: new TokenAmount(mainnetTokens.ETH, '1'), expected: false },
    { tokenAmount: { token: mainnetTokens.ETH, amount: '1' }, expected: true },
    { tokenAmount: { token: mainnetTokens.ETH.toObject(), amount: '1' }, expected: true },
  ];

  testCases.forEach(({ tokenAmount, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(isTokenAmountObject(tokenAmount)).to.eq(expected);
    });
  });
});

describe('Test isTokenAmount', function () {
  const testCases = [
    { tokenAmount: new TokenAmount(mainnetTokens.ETH, '1'), expected: true },
    { tokenAmount: { token: mainnetTokens.ETH, amount: '1' }, expected: false },
    { tokenAmount: { token: mainnetTokens.ETH.toObject(), amount: '1' }, expected: false },
  ];

  testCases.forEach(({ tokenAmount, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(isTokenAmount(tokenAmount)).to.eq(expected);
    });
  });
});

describe('TokenAmount', function () {
  context('Test new instance', function () {
    it('token', function () {
      const token = mainnetTokens.ETH;
      const tokenAmount = new TokenAmount(token);
      expect(tokenAmount.token.is(token)).to.be.true;
      expect(tokenAmount.amount).to.eq('0');
    });

    it('token, amount', function () {
      const token = mainnetTokens.ETH;
      const amount = '1';
      const tokenAmount = new TokenAmount(token, amount);
      expect(tokenAmount.token.is(token)).to.be.true;
      expect(tokenAmount.amount).to.eq(amount);
    });

    it('TokenAmountObject', function () {
      const testCases = [
        { token: mainnetTokens.ETH, amount: '1' },
        { token: mainnetTokens.ETH.toObject(), amount: '1' },
      ];

      testCases.forEach((testCase, i) => {
        it(`case ${i + 1}`, function () {
          const tokenAmount = new TokenAmount(testCase);
          expect(tokenAmount.token.is(testCase.token)).to.be.true;
          expect(tokenAmount.amount).to.eq(testCase.amount);
        });
      });
    });

    it('TokenAmountPair', function () {
      const testCases: TokenAmountPair[] = [
        [mainnetTokens.ETH, '1'],
        [mainnetTokens.ETH.toObject(), '1'],
      ];

      testCases.forEach((testCase, i) => {
        it(`case ${i + 1}`, function () {
          const tokenAmount = new TokenAmount(testCase);
          expect(tokenAmount.token.is(testCase[0])).to.be.true;
          expect(tokenAmount.amount).to.eq(testCase[1]);
        });
      });
    });

    it('TokenAmount', function () {
      const tokenAmount1 = new TokenAmount(mainnetTokens.ETH, '1');
      const tokenAmount2 = new TokenAmount(tokenAmount1);
      expect(tokenAmount2.token.is(tokenAmount1.token)).to.be.true;
      expect(tokenAmount2.amount).to.eq(tokenAmount1.amount);
    });
  });

  context('Test amountWei', function () {
    const testCases: { tokenAmount: TokenAmountPair; expected: string }[] = [
      { tokenAmount: [mainnetTokens.ETH, '1.1234567890123456789'], expected: '1123456789012345678' },
      { tokenAmount: [mainnetTokens.USDC, '1.1234567890123456789'], expected: '1123456' },
    ];

    testCases.forEach((testCase) => {
      it(`decimals ${testCase.tokenAmount[0].decimals}`, function () {
        const tokenAmount = new TokenAmount(testCase.tokenAmount);
        expect(tokenAmount.amountWei).to.eq(testCase.expected);
      });

      it(`decimals ${testCase.tokenAmount[0].decimals}`, function () {
        const tokenAmount = new TokenAmount(testCase.tokenAmount[0]);
        tokenAmount.set(testCase.tokenAmount[1]);
        expect(tokenAmount.amountWei).to.eq(testCase.expected);
      });
    });
  });

  context('Test precise amount', function () {
    const testCases: { tokenAmount: TokenAmountPair; expected: string }[] = [
      { tokenAmount: [mainnetTokens.ETH, '1.1234567890123456789'], expected: '1.123456789012345678' },
      { tokenAmount: [mainnetTokens.USDC, '1.1234567890123456789'], expected: '1.123456' },
    ];

    testCases.forEach((testCase) => {
      it(`decimals ${testCase.tokenAmount[0].decimals} new instance`, function () {
        const tokenAmount = new TokenAmount(testCase.tokenAmount);
        expect(tokenAmount.amount).to.eq(testCase.expected);
      });

      it(`decimals ${testCase.tokenAmount[0].decimals} set`, function () {
        const tokenAmount = new TokenAmount(testCase.tokenAmount[0]);
        tokenAmount.set(testCase.tokenAmount[1]);
        expect(tokenAmount.amount).to.eq(testCase.expected);
      });
    });
  });

  context('Test comparison', function () {
    const testCases = [
      {
        tokenAmountA: new TokenAmount(mainnetTokens.ETH, '1'),
        tokenAmountB: new TokenAmount(mainnetTokens.ETH, '1'),
        stringB: '1',
        expected: { eq: true, gt: false, gte: true, lt: false, lte: true },
      },
      {
        tokenAmountA: new TokenAmount(mainnetTokens.ETH, '1'),
        tokenAmountB: new TokenAmount(mainnetTokens.ETH, '0.9'),
        stringB: '0.9',
        expected: { eq: false, gt: true, gte: true, lt: false, lte: false },
      },
      {
        tokenAmountA: new TokenAmount(mainnetTokens.ETH, '1'),
        tokenAmountB: new TokenAmount(mainnetTokens.ETH, '1.1'),
        stringB: '1.1',
        expected: { eq: false, gt: false, gte: false, lt: true, lte: true },
      },
    ];

    testCases.forEach(({ tokenAmountA, tokenAmountB, stringB, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(tokenAmountA.eq(tokenAmountB)).to.eq(expected.eq);
        expect(tokenAmountA.eq(stringB)).to.eq(expected.eq);
        expect(tokenAmountA.gt(tokenAmountB)).to.eq(expected.gt);
        expect(tokenAmountA.gt(stringB)).to.eq(expected.gt);
        expect(tokenAmountA.gte(tokenAmountB)).to.eq(expected.gte);
        expect(tokenAmountA.gte(stringB)).to.eq(expected.gte);
        expect(tokenAmountA.lt(tokenAmountB)).to.eq(expected.lt);
        expect(tokenAmountA.lt(stringB)).to.eq(expected.lt);
        expect(tokenAmountA.lte(tokenAmountB)).to.eq(expected.lte);
        expect(tokenAmountA.lte(stringB)).to.eq(expected.lte);
      });
    });
  });

  context('Test small amount operations', function () {
    const tokenAmount1 = new TokenAmount(mainnetTokens.ETH).setWei(1);
    tokenAmount1.add('0.000000000000000009');
    expect(tokenAmount1.amount).to.eq('0.00000000000000001');
    tokenAmount1.addWei(5);
    expect(tokenAmount1.amount).to.eq('0.000000000000000015');

    const tokenAmount2 = new TokenAmount(mainnetTokens.ETH).setWei(100);
    tokenAmount2.sub('0.00000000000000001');
    expect(tokenAmount2.amount).to.eq('0.00000000000000009');
    tokenAmount2.subWei(5);
    expect(tokenAmount2.amount).to.eq('0.000000000000000085');
  });

  context('Test toJSON', function () {
    const testCases = [
      {
        tokenAmount: new TokenAmount(mainnetTokens.ETH, '1.1234567890123456789'),
        expected:
          '{"token":{"chainId":1,"address":"0x0000000000000000000000000000000000000000","decimals":18,"symbol":"ETH","name":"Ethereum","logoUri":"https://cdn.furucombo.app/assets/img/token/ETH.png"},"amount":"1.123456789012345678"}',
      },
      {
        tokenAmount: new TokenAmount(mainnetTokens.USDC, '1.1234567890123456789'),
        expected:
          '{"token":{"chainId":1,"address":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","decimals":6,"symbol":"USDC","name":"USD Coin","logoUri":"https://cdn.furucombo.app/assets/img/token/USDC.svg"},"amount":"1.123456"}',
      },
    ];

    testCases.forEach(({ tokenAmount, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(JSON.stringify(tokenAmount)).to.eq(expected);
      });
    });
  });
});

describe('TokenAmounts', function () {
  context('Test new instance', function () {
    it('[]', function () {
      const tokenAmounts = new TokenAmounts();
      expect(JSON.stringify(tokenAmounts)).to.eq('[]');
    });

    it('arg0 is TokenAmountObject', function () {
      const testCases = [
        { token: mainnetTokens.ETH, amount: '1' },
        { token: mainnetTokens.ETH.toObject(), amount: '1' },
      ];

      testCases.forEach((testCase, i) => {
        it(`case ${i + 1}`, function () {
          const tokenAmounts = new TokenAmounts(testCase, [mainnetTokens.WBTC, '2']);
          expect(JSON.stringify(tokenAmounts)).to.eq(
            JSON.stringify([
              { token: mainnetTokens.ETH, amount: '1' },
              { token: mainnetTokens.WBTC, amount: '2' },
            ])
          );
        });
      });
    });

    it('arg0 is TokenAmountPair', function () {
      const tokenAmounts = new TokenAmounts(
        [mainnetTokens.WBTC, '2'],
        { token: mainnetTokens.ETH, amount: '1' },
        { token: mainnetTokens.ETH.toObject(), amount: '2' }
      );
      expect(JSON.stringify(tokenAmounts)).to.eq(
        JSON.stringify([
          { token: mainnetTokens.ETH, amount: '3' },
          { token: mainnetTokens.WBTC, amount: '2' },
        ])
      );
    });

    it('arg0 is TokenAmount', function () {
      const tokenAmount = new TokenAmount(mainnetTokens.DAI, '1');
      const tokenAmounts = new TokenAmounts(
        tokenAmount,
        [mainnetTokens.WBTC, '2'],
        { token: mainnetTokens.ETH, amount: '1' },
        { token: mainnetTokens.ETH.toObject(), amount: '1' }
      );
      expect(JSON.stringify(tokenAmounts)).to.eq(
        JSON.stringify([
          { token: mainnetTokens.DAI, amount: '1' },
          { token: mainnetTokens.ETH, amount: '2' },
          { token: mainnetTokens.WBTC, amount: '2' },
        ])
      );
    });

    it('arg0 is TokenAmountTypes', function () {
      const tokenAmount = new TokenAmount(mainnetTokens.DAI, '1');
      const tokenAmounts = new TokenAmounts([
        tokenAmount,
        [mainnetTokens.WBTC, '2'],
        { token: mainnetTokens.ETH, amount: '1' },
        { token: mainnetTokens.ETH.toObject(), amount: '1' },
      ]);
      expect(JSON.stringify(tokenAmounts)).to.eq(
        JSON.stringify([
          { token: mainnetTokens.DAI, amount: '1' },
          { token: mainnetTokens.ETH, amount: '2' },
          { token: mainnetTokens.WBTC, amount: '2' },
        ])
      );
    });
  });

  context('Test add', function () {
    const testCases: { tokenAmounts: TokenAmountPair[]; expected: TokenAmountObject[] }[] = [
      {
        tokenAmounts: [
          [mainnetTokens.WBTC, '2'],
          [mainnetTokens.DAI, '1'],
          [mainnetTokens.USDC, '3'],
          [mainnetTokens.DAI, '4'],
          [mainnetTokens.USDC, '3'],
        ],
        expected: [
          { token: mainnetTokens.DAI, amount: '5' },
          { token: mainnetTokens.USDC, amount: '6' },
          { token: mainnetTokens.WBTC, amount: '2' },
        ],
      },
      {
        tokenAmounts: [
          [mainnetTokens.WBTC, '2'],
          [mainnetTokens.DAI, '1'],
          [mainnetTokens.ETH, '3'],
          [mainnetTokens.WETH, '4'],
          [mainnetTokens.USDC, '3'],
        ],
        expected: [
          { token: mainnetTokens.DAI, amount: '1' },
          { token: mainnetTokens.ETH, amount: '3' },
          { token: mainnetTokens.USDC, amount: '3' },
          { token: mainnetTokens.WBTC, amount: '2' },
          { token: mainnetTokens.WETH, amount: '4' },
        ],
      },
    ];

    testCases.forEach(({ tokenAmounts, expected }, i) => {
      it(`case ${i + 1}`, function () {
        const _tokenAmounts = new TokenAmounts();
        for (const tokenAmount of tokenAmounts) {
          _tokenAmounts.add(tokenAmount);
        }
        expect(JSON.stringify(_tokenAmounts)).to.eq(JSON.stringify(expected));
      });
    });
  });

  context('Test compact', function () {
    it('case 1', function () {
      const tokenAmounts = new TokenAmounts();
      tokenAmounts.add(mainnetTokens.ETH, '3');
      tokenAmounts.add(mainnetTokens.DAI, '4');
      tokenAmounts.add(mainnetTokens.USDC, '3');
      tokenAmounts.sub(mainnetTokens.ETH, '3');

      expect(JSON.stringify(tokenAmounts.compact())).to.eq(
        JSON.stringify([
          { token: mainnetTokens.DAI, amount: '4' },
          { token: mainnetTokens.USDC, amount: '3' },
        ])
      );
    });
  });

  context('Test merge', function () {
    const testCases: { targe: TokenAmounts; sources: TokenAmounts | TokenAmounts[]; expected: TokenAmounts }[] = [
      {
        targe: new TokenAmounts([mainnetTokens.WBTC, '2'], [mainnetTokens.DAI, '1'], [mainnetTokens.USDC, '3']),
        sources: new TokenAmounts([mainnetTokens.WBTC, '2'], [mainnetTokens.USDC, '4']),
        expected: new TokenAmounts([mainnetTokens.WBTC, '4'], [mainnetTokens.DAI, '1'], [mainnetTokens.USDC, '7']),
      },
      {
        targe: new TokenAmounts([mainnetTokens.WBTC, '2'], [mainnetTokens.DAI, '1'], [mainnetTokens.USDC, '3']),
        sources: [
          new TokenAmounts([mainnetTokens.WBTC, '2'], [mainnetTokens.USDC, '4']),
          new TokenAmounts([mainnetTokens.DAI, '1'], [mainnetTokens.USDC, '2']),
        ],
        expected: new TokenAmounts([mainnetTokens.WBTC, '4'], [mainnetTokens.DAI, '2'], [mainnetTokens.USDC, '9']),
      },
    ];

    testCases.forEach(({ targe, sources, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(JSON.stringify(targe.merge(sources))).to.eq(JSON.stringify(expected));
      });
    });
  });
});
