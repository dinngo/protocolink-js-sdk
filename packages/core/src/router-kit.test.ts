import { RouterKit } from './router-kit';
import { WrapMode } from './logic-types';
import * as common from '@protocolink/common';
import { expect } from 'chai';

describe('RouterKit', function () {
  context('Test getAgentImplementationAddress', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        expected: '0x4D4c961De7140E642b7217f221b73e859E3A6482',
      },
      {
        chainId: common.ChainId.optimism,
        expected: '0x4D4c961De7140E642b7217f221b73e859E3A6482',
      },
      {
        chainId: common.ChainId.bnb,
        expected: '0x4D4c961De7140E642b7217f221b73e859E3A6482',
      },
      {
        chainId: common.ChainId.gnosis,
        expected: '0x4D4c961De7140E642b7217f221b73e859E3A6482',
      },
      {
        chainId: common.ChainId.polygon,
        expected: '0x4D4c961De7140E642b7217f221b73e859E3A6482',
      },
      {
        chainId: common.ChainId.zksync,
        expected: '0xB643d9A266DB03e038670058685Af10c13238EC6',
      },
      {
        chainId: common.ChainId.metis,
        expected: '0x4D4c961De7140E642b7217f221b73e859E3A6482',
      },
      {
        chainId: common.ChainId.polygonZkevm,
        expected: '0x4D4c961De7140E642b7217f221b73e859E3A6482',
      },
      {
        chainId: common.ChainId.base,
        expected: '0x4D4c961De7140E642b7217f221b73e859E3A6482',
      },
      {
        chainId: common.ChainId.iota,
        expected: '0x4D4c961De7140E642b7217f221b73e859E3A6482',
      },
      {
        chainId: common.ChainId.arbitrum,
        expected: '0x4D4c961De7140E642b7217f221b73e859E3A6482',
      },
      {
        chainId: common.ChainId.avalanche,
        expected: '0x4D4c961De7140E642b7217f221b73e859E3A6482',
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
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
      },
      {
        chainId: common.ChainId.optimism,
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
      },
      {
        chainId: common.ChainId.bnb,
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
      },
      {
        chainId: common.ChainId.gnosis,
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
      },
      {
        chainId: common.ChainId.polygon,
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
      },
      {
        chainId: common.ChainId.zksync,
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
      },
      {
        chainId: common.ChainId.metis,
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
      },
      {
        chainId: common.ChainId.polygonZkevm,
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
      },
      {
        chainId: common.ChainId.base,
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
      },
      {
        chainId: common.ChainId.iota,
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
      },
      {
        chainId: common.ChainId.arbitrum,
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
      },
      {
        chainId: common.ChainId.avalanche,
        expected: '0xFB20753f85f89be6F42D228667D70e62D1Ba5f75',
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
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
      },
      {
        chainId: common.ChainId.optimism,
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
      },
      {
        chainId: common.ChainId.bnb,
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
      },
      {
        chainId: common.ChainId.gnosis,
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
      },
      {
        chainId: common.ChainId.polygon,
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
      },
      {
        chainId: common.ChainId.zksync,
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
      },
      {
        chainId: common.ChainId.metis,
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
      },
      {
        chainId: common.ChainId.polygonZkevm,
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
      },
      {
        chainId: common.ChainId.base,
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
      },
      {
        chainId: common.ChainId.iota,
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
      },
      {
        chainId: common.ChainId.arbitrum,
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
      },
      {
        chainId: common.ChainId.avalanche,
        expected: '0xfb20753f85f89be6f42d228667d70e62d1ba5f75000000000000000000002710',
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
        chainId: common.ChainId.optimism,
        expected: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      },
      {
        chainId: common.ChainId.bnb,
        expected: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      },
      {
        chainId: common.ChainId.gnosis,
        expected: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      },
      {
        chainId: common.ChainId.polygon,
        expected: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      },
      {
        chainId: common.ChainId.zksync,
        expected: '0x87C0878B54c174199f438470FD74B3F7e1Def295',
      },
      {
        chainId: common.ChainId.metis,
        expected: '0x2EE5407017B878774b58c34A8c09CAcC94aDd69B',
      },
      {
        chainId: common.ChainId.polygonZkevm,
        expected: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      },
      {
        chainId: common.ChainId.base,
        expected: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      },
      {
        chainId: common.ChainId.iota,
        expected: '0x8d8B490fCe6Ca1A31752E7cFAFa954Bf30eB7EE2',
      },
      {
        chainId: common.ChainId.arbitrum,
        expected: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      },
      {
        chainId: common.ChainId.avalanche,
        expected: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
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
        expected: '0x8f6325f5E452B8Aa8137722A9f584C41c32d53A1',
      },
      {
        chainId: common.ChainId.mainnet,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x22CF139619f4B8Afc863beCa670615C6310aC7c6',
      },
      {
        chainId: common.ChainId.optimism,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0x8f6325f5E452B8Aa8137722A9f584C41c32d53A1',
      },
      {
        chainId: common.ChainId.optimism,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x22CF139619f4B8Afc863beCa670615C6310aC7c6',
      },
      {
        chainId: common.ChainId.bnb,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0x8f6325f5E452B8Aa8137722A9f584C41c32d53A1',
      },
      {
        chainId: common.ChainId.bnb,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x22CF139619f4B8Afc863beCa670615C6310aC7c6',
      },
      {
        chainId: common.ChainId.gnosis,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0x8f6325f5E452B8Aa8137722A9f584C41c32d53A1',
      },
      {
        chainId: common.ChainId.gnosis,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x22CF139619f4B8Afc863beCa670615C6310aC7c6',
      },
      {
        chainId: common.ChainId.polygon,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0x8f6325f5E452B8Aa8137722A9f584C41c32d53A1',
      },
      {
        chainId: common.ChainId.polygon,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x22CF139619f4B8Afc863beCa670615C6310aC7c6',
      },
      {
        chainId: common.ChainId.zksync,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0xE65a6d15C0EA2f47B80db8482C8d2dC5Ff69844c',
      },
      {
        chainId: common.ChainId.zksync,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x70B901C6013f5542b4039C9c96402cfAE9Ae6306',
      },
      {
        chainId: common.ChainId.metis,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0x8f6325f5E452B8Aa8137722A9f584C41c32d53A1',
      },
      {
        chainId: common.ChainId.metis,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x22CF139619f4B8Afc863beCa670615C6310aC7c6',
      },
      {
        chainId: common.ChainId.polygonZkevm,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0x8f6325f5E452B8Aa8137722A9f584C41c32d53A1',
      },
      {
        chainId: common.ChainId.polygonZkevm,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x22CF139619f4B8Afc863beCa670615C6310aC7c6',
      },
      {
        chainId: common.ChainId.base,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0x8f6325f5E452B8Aa8137722A9f584C41c32d53A1',
      },
      {
        chainId: common.ChainId.base,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x22CF139619f4B8Afc863beCa670615C6310aC7c6',
      },
      {
        chainId: common.ChainId.iota,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0x8f6325f5E452B8Aa8137722A9f584C41c32d53A1',
      },
      {
        chainId: common.ChainId.iota,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x22CF139619f4B8Afc863beCa670615C6310aC7c6',
      },
      {
        chainId: common.ChainId.arbitrum,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0x8f6325f5E452B8Aa8137722A9f584C41c32d53A1',
      },
      {
        chainId: common.ChainId.arbitrum,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x22CF139619f4B8Afc863beCa670615C6310aC7c6',
      },
      {
        chainId: common.ChainId.avalanche,
        account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
        expected: '0x8f6325f5E452B8Aa8137722A9f584C41c32d53A1',
      },
      {
        chainId: common.ChainId.avalanche,
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        expected: '0x22CF139619f4B8Afc863beCa670615C6310aC7c6',
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
              inputs: [{ token: common.mainnetTokens.USDC.address, balanceBps: 5000, amountOrOffset: 32 }],
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
            verifyingContract: '0xDec80E988F4baF43be69c13711453013c212feA8',
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
