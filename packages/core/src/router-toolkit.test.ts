import { RouterToolkit } from './router-toolkit';
import { WrapMode } from './logic-types';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { mainnetTokens } from '@protocolink/test-helpers';

describe('RouterToolkit', function () {
  context('Test getAgentImplementationAddress', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        expected: '0x8a3C196b23E4eAB6e9f9e4e488E9591066732797',
      },
      {
        chainId: common.ChainId.polygon,
        expected: '0x8a3C196b23E4eAB6e9f9e4e488E9591066732797',
      },
      {
        chainId: common.ChainId.arbitrum,
        expected: '0x8a3C196b23E4eAB6e9f9e4e488E9591066732797',
      },
      {
        chainId: common.ChainId.zksync,
        expected: '0xB4d14eA72b7Df945e57724336b50C4267E59a4EB',
      },
    ];

    testCases.forEach(({ chainId, expected }, i) => {
      it(`case ${i + 1}`, async () => {
        const routerToolkit = new RouterToolkit(chainId);
        const agentImplementationAddress = await routerToolkit.getAgentImplementationAddress();
        expect(agentImplementationAddress).to.eq(expected);
      });
    });
  });

  context('Test getPermit2Address', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        expected: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      },
      {
        chainId: common.ChainId.polygon,
        expected: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      },
      {
        chainId: common.ChainId.arbitrum,
        expected: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      },
      {
        chainId: common.ChainId.zksync,
        expected: '0x87C0878B54c174199f438470FD74B3F7e1Def295',
      },
    ];

    testCases.forEach(({ chainId, expected }, i) => {
      it(`case ${i + 1}`, async () => {
        const routerToolkit = new RouterToolkit(chainId);
        const permit2Address = await routerToolkit.getPermit2Address();
        expect(permit2Address).to.eq(expected);
      });
    });
  });

  context('Test calcAgent', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0xE39395e0d241808cc55d8538aB263766a708fe5f',
      },
      {
        chainId: common.ChainId.mainnet,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x32CBbfE9D49C867331d9c74E42b617D675Ba192d',
      },
      {
        chainId: common.ChainId.polygon,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0xE39395e0d241808cc55d8538aB263766a708fe5f',
      },
      {
        chainId: common.ChainId.polygon,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x32CBbfE9D49C867331d9c74E42b617D675Ba192d',
      },
      {
        chainId: common.ChainId.arbitrum,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0xE39395e0d241808cc55d8538aB263766a708fe5f',
      },
      {
        chainId: common.ChainId.arbitrum,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x32CBbfE9D49C867331d9c74E42b617D675Ba192d',
      },
      {
        chainId: common.ChainId.zksync,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0x6112094F75A4315b623f2801598eEFD4634B4420',
      },
      {
        chainId: common.ChainId.zksync,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0xbD6F5dcaCA0D9bC4b3AbaD12Dd0edE54C32Da90E',
      },
    ];

    testCases.forEach(({ chainId, account, expected }, i) => {
      it(`case ${i + 1}`, async () => {
        const routerToolkit = new RouterToolkit(chainId);
        const accountAgent = await routerToolkit.calcAgent(account);
        expect(accountAgent).to.eq(expected);
      });
    });
  });

  context('Test buildLogicBatchTypedData', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        values: {
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
            verifyingContract: '0x4E744c3E6973D34ee130B7E668Abc14CD49ca16e',
          },
          types: {
            LogicBatch: [
              { name: 'logics', type: 'Logic[]' },
              { name: 'fees', type: 'Fee[]' },
              { name: 'deadline', type: 'uint256' },
            ],
            Logic: [
              { name: 'to', type: 'address' },
              { name: 'data', type: 'bytes' },
              { name: 'inputs', type: 'Input[]' },
              { name: 'wrapMode', type: 'uint8' },
              { name: 'approveTo', type: 'address' },
              { name: 'callback', type: 'address' },
            ],
            Input: [
              { name: 'token', type: 'address' },
              { name: 'balanceBps', type: 'uint256' },
              { name: 'amountOrOffset', type: 'uint256' },
            ],
            Fee: [
              { name: 'token', type: 'address' },
              { name: 'amount', type: 'uint256' },
              { name: 'metadata', type: 'bytes32' },
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

    testCases.forEach(({ chainId, values, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        const routerToolkit = new RouterToolkit(chainId);
        expect(routerToolkit.buildLogicBatchTypedData(values)).to.deep.eq(expected);
      });
    });
  });
});
