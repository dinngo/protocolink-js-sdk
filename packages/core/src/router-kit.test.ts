import { RouterKit } from './router-kit';
import { WrapMode } from './logic-types';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { mainnetTokens } from '@protocolink/test-helpers';

describe('RouterKit', function () {
  context('Test getAgentImplementationAddress', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        expected: '0x903847853d5fE12BaC24dD85903190528CF6070b',
      },
      {
        chainId: common.ChainId.polygon,
        expected: '0x903847853d5fE12BaC24dD85903190528CF6070b',
      },
      {
        chainId: common.ChainId.arbitrum,
        expected: '0x903847853d5fE12BaC24dD85903190528CF6070b',
      },
      {
        chainId: common.ChainId.zksync,
        expected: '0x1f4f87CDf642bAfD106fa42Ae327f5bAE7ab8F02',
      },
    ];

    testCases.forEach(({ chainId, expected }, i) => {
      it(`case ${i + 1}`, async () => {
        const routerToolkit = new RouterKit(chainId);
        const agentImplementationAddress = await routerToolkit.getAgentImplementationAddress();
        expect(agentImplementationAddress).to.eq(expected);
      });
    });
  });

  context('Test getDefaultCollector', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        expected: '0xDdbe07CB6D77e81802C55bB381546c0DA51163dd',
      },
      {
        chainId: common.ChainId.polygon,
        expected: '0xDdbe07CB6D77e81802C55bB381546c0DA51163dd',
      },
      {
        chainId: common.ChainId.arbitrum,
        expected: '0xDdbe07CB6D77e81802C55bB381546c0DA51163dd',
      },
      {
        chainId: common.ChainId.zksync,
        expected: '0xDdbe07CB6D77e81802C55bB381546c0DA51163dd',
      },
    ];

    testCases.forEach(({ chainId, expected }, i) => {
      it(`case ${i + 1}`, async () => {
        const routerToolkit = new RouterKit(chainId);
        const defaultCollector = await routerToolkit.getDefaultCollector();
        expect(defaultCollector).to.eq(expected);
      });
    });
  });

  context('Test getDefaultReferral', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        expected: '0xddbe07cb6d77e81802c55bb381546c0da51163dd000000000000000000002710',
      },
      {
        chainId: common.ChainId.polygon,
        expected: '0xddbe07cb6d77e81802c55bb381546c0da51163dd000000000000000000002710',
      },
      {
        chainId: common.ChainId.arbitrum,
        expected: '0xddbe07cb6d77e81802c55bb381546c0da51163dd000000000000000000002710',
      },
      {
        chainId: common.ChainId.zksync,
        expected: '0xddbe07cb6d77e81802c55bb381546c0da51163dd000000000000000000002710',
      },
    ];

    testCases.forEach(({ chainId, expected }, i) => {
      it(`case ${i + 1}`, async () => {
        const routerToolkit = new RouterKit(chainId);
        const defaultReferral = await routerToolkit.getDefaultReferral();
        expect(defaultReferral).to.eq(expected);
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
        const routerToolkit = new RouterKit(chainId);
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
        expected: '0xefc25B94FFeB90d5045cDAA936a52489bfBeA9D8',
      },
      {
        chainId: common.ChainId.mainnet,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x236E002fb1ba4043463aa89E1ccF845d2e3661a6',
      },
      {
        chainId: common.ChainId.polygon,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0xefc25B94FFeB90d5045cDAA936a52489bfBeA9D8',
      },
      {
        chainId: common.ChainId.polygon,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x236E002fb1ba4043463aa89E1ccF845d2e3661a6',
      },
      {
        chainId: common.ChainId.arbitrum,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0xefc25B94FFeB90d5045cDAA936a52489bfBeA9D8',
      },
      {
        chainId: common.ChainId.arbitrum,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x236E002fb1ba4043463aa89E1ccF845d2e3661a6',
      },
      {
        chainId: common.ChainId.zksync,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0xE25c878fd40FF3aD79FaC9462563Ff41CE059e96',
      },
      {
        chainId: common.ChainId.zksync,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x7A4908e637ae38D565Ea88010F75EB5dBdf39fFc',
      },
    ];

    testCases.forEach(({ chainId, account, expected }, i) => {
      it(`case ${i + 1}`, async () => {
        const routerToolkit = new RouterKit(chainId);
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
          referrals: [],
          deadline: 10000000000,
        },
        expected: {
          domain: {
            name: 'Protocolink',
            version: '1',
            chainId: 1,
            verifyingContract: '0x3fa3B62F0c9c13733245A778DE4157E47Cf5bA21',
          },
          types: {
            LogicBatch: [
              { name: 'logics', type: 'Logic[]' },
              { name: 'fees', type: 'Fee[]' },
              { name: 'referrals', type: 'bytes32[]' },
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
            referrals: [],
            deadline: 10000000000,
          },
        },
      },
    ];

    testCases.forEach(({ chainId, values, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        const routerToolkit = new RouterKit(chainId);
        expect(routerToolkit.buildLogicBatchTypedData(values)).to.deep.eq(expected);
      });
    });
  });
});
