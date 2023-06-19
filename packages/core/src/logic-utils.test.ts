import { BPS_NOT_USED } from './constants';
import { WrapMode } from './logic-types';
import * as common from '@furucombo/composable-router-common';
import { constants } from 'ethers';
import { expect } from 'chai';
import { mainnetTokens } from '@furucombo/composable-router-test-helpers';
import { newCallbackParams, newLogic, newLogicInput } from './logic-utils';

describe('Test newLogicInput', function () {
  const testCases = [
    {
      options: {
        input: new common.TokenAmount(mainnetTokens.ETH, '1'),
      },
      expected: {
        token: common.ELASTIC_ADDRESS,
        balanceBps: BPS_NOT_USED,
        amountOrOffset: '1000000000000000000',
      },
    },
    {
      options: {
        input: new common.TokenAmount(mainnetTokens.WETH, '1'),
      },
      expected: {
        token: mainnetTokens.WETH.address,
        balanceBps: BPS_NOT_USED,
        amountOrOffset: '1000000000000000000',
      },
    },
    {
      options: {
        input: new common.TokenAmount(mainnetTokens.USDC, '1'),
      },
      expected: {
        token: mainnetTokens.USDC.address,
        balanceBps: BPS_NOT_USED,
        amountOrOffset: '1000000',
      },
    },
    {
      options: {
        input: new common.TokenAmount(mainnetTokens.USDC, '1'),
        balanceBps: 5000,
      },
      expected: {
        token: mainnetTokens.USDC.address,
        balanceBps: BPS_NOT_USED,
        amountOrOffset: '1000000',
      },
    },
    {
      options: {
        input: new common.TokenAmount(mainnetTokens.USDC, '1'),
        balanceBps: 5000,
        amountOffset: 0,
      },
      expected: {
        token: mainnetTokens.USDC.address,
        balanceBps: 5000,
        amountOrOffset: 0,
      },
    },
    {
      options: {
        input: new common.TokenAmount(mainnetTokens.USDC, '1'),
        balanceBps: 5000,
        amountOffset: 32,
      },
      expected: {
        token: mainnetTokens.USDC.address,
        balanceBps: 5000,
        amountOrOffset: 32,
      },
    },
  ];

  testCases.forEach(({ options, expected }, i) => {
    it(`case ${i + 1}`, function () {
      const { token, balanceBps, amountOrOffset } = newLogicInput(options);
      expect(token).to.eq(expected.token);
      expect(balanceBps).to.eq(expected.balanceBps);
      expect(amountOrOffset).to.eq(expected.amountOrOffset);
    });
  });
});

describe('Test newLogic', function () {
  const testCases = [
    {
      options: {
        to: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        data: '0x',
      },
      expected: {
        inputs: [],
        wrapMode: WrapMode.none,
        approveTo: constants.AddressZero,
        callback: constants.AddressZero,
      },
    },
    {
      options: {
        to: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        data: '0x',
        inputs: [{ token: mainnetTokens.USDC.address, balanceBps: 5000, amountOrOffset: 32 }],
        wrapMode: WrapMode.wrapBefore,
        approveTo: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        callback: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      expected: {
        inputs: [{ token: mainnetTokens.USDC.address, balanceBps: 5000, amountOrOffset: 32 }],
        wrapMode: WrapMode.wrapBefore,
        approveTo: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        callback: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
    },
  ];

  testCases.forEach(({ options, expected }, i) => {
    it(`case ${i + 1}`, function () {
      const { inputs, wrapMode, approveTo, callback } = newLogic(options);
      expect(inputs).to.deep.eq(expected.inputs);
      expect(wrapMode).to.eq(expected.wrapMode);
      expect(approveTo).to.eq(expected.approveTo);
      expect(callback).to.eq(expected.callback);
    });
  });
});

describe('Test newCallbackParams', function () {
  const testCases = [
    {
      logics: [newLogic({ to: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', data: '0x' })],
      expected:
        '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
    {
      logics: [
        newLogic({
          to: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          data: '0x',
          inputs: [{ token: mainnetTokens.USDC.address, balanceBps: 5000, amountOrOffset: 32 }],
          wrapMode: WrapMode.wrapBefore,
          approveTo: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          callback: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        }),
      ],
      expected:
        '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000013880000000000000000000000000000000000000000000000000000000000000020',
    },
  ];

  testCases.forEach(({ logics, expected }, i) => {
    it(`case ${i + 1}`, function () {
      const params = newCallbackParams(logics);
      expect(params).to.deep.eq(expected);
    });
  });
});
