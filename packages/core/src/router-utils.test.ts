import { WrapMode } from './logic-types';
import { expect } from 'chai';
import { getLogicData } from './router-utils';
import { mainnetTokens } from '@protocolink/test-helpers';

describe('LogicBatch', function () {
  const testCases = [
    {
      value: {
        logics: [
          {
            to: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
            data: '0x',
            inputs: [{ token: mainnetTokens.USDC.address, balanceBps: 5000, amountOrOffset: 32 }],
            wrapMode: WrapMode.wrapBefore,
            approveTo: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            callback: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
        ],
        fees: [],
        deadline: 10000000000,
      },
      expected: {
        domain: {
          name: 'Protocolink',
          version: '1',
          chainId: 1,
          verifyingContract: '0xf4dEf6B4389eAb49dF2a7D67890810e5249B5E70',
        },
        types: {
          LogicBatch: [
            {
              name: 'logics',
              type: 'Logic[]',
            },
            {
              name: 'fees',
              type: 'Fee[]',
            },
            {
              name: 'deadline',
              type: 'uint256',
            },
          ],
          Logic: [
            {
              name: 'to',
              type: 'address',
            },
            {
              name: 'data',
              type: 'bytes',
            },
            {
              name: 'inputs',
              type: 'Input[]',
            },
            {
              name: 'wrapMode',
              type: 'uint8',
            },
            {
              name: 'approveTo',
              type: 'address',
            },
            {
              name: 'callback',
              type: 'address',
            },
          ],
          Input: [
            {
              name: 'token',
              type: 'address',
            },
            {
              name: 'balanceBps',
              type: 'uint256',
            },
            {
              name: 'amountOrOffset',
              type: 'uint256',
            },
          ],
          Fee: [
            {
              name: 'token',
              type: 'address',
            },
            {
              name: 'amount',
              type: 'uint256',
            },
            {
              name: 'metadata',
              type: 'bytes32',
            },
          ],
        },
        values: {
          logics: [
            {
              to: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
              data: '0x',
              inputs: [
                {
                  token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                  balanceBps: 5000,
                  amountOrOffset: 32,
                },
              ],
              wrapMode: 1,
              approveTo: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              callback: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            },
          ],
          fees: [],
          deadline: 10000000000,
        },
      },
    },
  ];

  testCases.forEach(({ value, expected }, i) => {
    it(`case ${i + 1}`, async function () {
      expect(getLogicData(1, value)).to.deep.eq(expected);
    });
  });
});
