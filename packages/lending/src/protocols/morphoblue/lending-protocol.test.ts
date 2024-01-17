import { LendingProtocol } from './lending-protocol';
import * as common from '@protocolink/common';
import { expect } from 'chai';

describe('Test Morpho Blue LendingProtocol', function () {
  context('Test getPortfolio', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        blockTag: 18982784,
        expected: {
          chainId: 1,
          protocolId: 'morphoblue',
          marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
          utilization: '0.77042676604681803248',
          healthRate: '1.2979819031095695877',
          netAPY: '-0.03351168623896312071',
          totalSupplyUSD: '15.09380306985',
          totalBorrowUSD: '10.00065610234878',
          supplies: [
            {
              token: {
                chainId: 1,
                address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
                decimals: 18,
                symbol: 'wstETH',
                name: 'Wrapped liquid staked Ether 2.0',
              },
              price: '3018.76061397',
              balance: '0.005',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.86',
              liquidationThreshold: '0.86',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '0.000002928670508723',
            },
          ],
          borrows: [
            {
              token: {
                chainId: 1,
                address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin',
              },
              price: '1.00006181',
              balances: ['10.000038'],
              apys: ['0.0170668745527347'],
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '2359558.186903',
            },
          ],
        },
      },
    ];

    testCases.forEach(({ chainId, marketId, account, expected, blockTag }) => {
      it(`${common.toNetworkId(chainId)} ${marketId} market`, async function () {
        const protocol = new LendingProtocol(chainId);
        protocol.setBlockTag(blockTag);
        const portfolio = await protocol.getPortfolio(account, marketId);
        expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(expected));
      }).timeout(60000);
    });
  });
});
