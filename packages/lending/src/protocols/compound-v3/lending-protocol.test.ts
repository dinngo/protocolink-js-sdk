import { LendingProtocol } from './lending-protocol';
import { arbitrumTokens, mainnetTokens, polygonTokens } from './tokens';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('Test Compound V3 LendingProtocol', function () {
  context('Test getPortfolio', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        marketId: logics.compoundv3.MarketId.USDC,
        account: '0x8d1Fb1241880d2A30d9d2762C8dB643a5145B21B',
        blockTag: 17699700,
        expected: {
          chainId: 1,
          protocolId: 'compound-v3',
          marketId: 'USDC',
          utilization: '0',
          healthRate: 'Infinity',
          netAPY: '0.052483458259584',
          totalSupplyUSD: '802.844449',
          totalBorrowUSD: '0',
          supplies: [
            {
              token: {
                chainId: 1,
                address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin',
              },
              price: '1',
              balance: '802.844449',
              apy: '0.052483458259584',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
              isNotCollateral: true,
            },
            {
              token: {
                chainId: 1,
                address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
                decimals: 18,
                symbol: 'COMP',
                name: 'Compound',
              },
              price: '75.002',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.65',
              liquidationThreshold: '0.7',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
                decimals: 8,
                symbol: 'WBTC',
                name: 'Wrapped BTC',
              },
              price: '30298.95',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.7',
              liquidationThreshold: '0.77',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                decimals: 18,
                symbol: 'WETH',
                name: 'Wrapped Ether',
              },
              price: '1933.940035',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.825',
              liquidationThreshold: '0.895',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
                decimals: 18,
                symbol: 'UNI',
                name: 'Uniswap',
              },
              price: '5.8920278',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.75',
              liquidationThreshold: '0.81',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
                decimals: 18,
                symbol: 'LINK',
                name: 'ChainLink Token',
              },
              price: '6.96700785',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.79',
              liquidationThreshold: '0.85',
              isNotCollateral: false,
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
              price: '1',
              balances: ['0'],
              apys: ['0.039969999949824'],
            },
          ],
        },
      },
      {
        chainId: common.ChainId.mainnet,
        marketId: logics.compoundv3.MarketId.ETH,
        account: '0xAa43599FbCd3C655f6Fe6e69dba8477062f4eFAD',
        blockTag: 17699700,
        expected: {
          chainId: 1,
          protocolId: 'compound-v3',
          marketId: 'ETH',
          utilization: '0',
          healthRate: 'Infinity',
          netAPY: '0.012615558222672',
          totalSupplyUSD: '8966.95502603240985750683884',
          totalBorrowUSD: '0',
          supplies: [
            {
              token: {
                chainId: 1,
                address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                decimals: 18,
                symbol: 'WETH',
                name: 'Wrapped Ether',
              },
              price: '1933.940035',
              balance: '4.636625160941150824',
              apy: '0.012615558222672',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
              isNotCollateral: true,
            },
            {
              token: {
                chainId: 1,
                address: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
                decimals: 18,
                symbol: 'cbETH',
                name: 'Coinbase Wrapped Staked ETH',
              },
              price: '2016.13917792',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.9',
              liquidationThreshold: '0.93',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
                decimals: 18,
                symbol: 'wstETH',
                name: 'Wrapped liquid staked Ether 2.0',
              },
              price: '2188.89305168',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.9',
              liquidationThreshold: '0.93',
              isNotCollateral: false,
            },
          ],
          borrows: [
            {
              token: {
                chainId: 1,
                address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                decimals: 18,
                symbol: 'WETH',
                name: 'Wrapped Ether',
              },
              price: '1933.940035',
              balances: ['0'],
              apys: ['0.032931764469936'],
            },
          ],
        },
      },
      {
        chainId: common.ChainId.polygon,
        marketId: logics.compoundv3.MarketId.USDC,
        account: '0x9fC7D6E7a3d4aB7b8b28d813f68674C8A6e91e83',
        blockTag: 45221016,
        expected: {
          chainId: 137,
          protocolId: 'compound-v3',
          marketId: 'USDC',
          utilization: '0.62899605117035539651',
          healthRate: '1.6924051066004987073',
          netAPY: '-0.04077766466005592672',
          totalSupplyUSD: '350.776292007540263981961',
          totalBorrowUSD: '170.9935994506148',
          supplies: [
            {
              token: {
                chainId: 137,
                address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin (PoS)',
              },
              price: '0.99995719',
              balance: '0',
              apy: '0.025882667487072',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
              isNotCollateral: true,
            },
            {
              token: {
                chainId: 137,
                address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
                decimals: 18,
                symbol: 'WETH',
                name: 'Wrapped Ether',
              },
              price: '1901.797',
              balance: '0.184444655243193813',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.775',
              liquidationThreshold: '0.825',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 137,
                address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
                decimals: 8,
                symbol: 'WBTC',
                name: '(PoS) Wrapped BTC',
              },
              price: '30035.14459631',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.7',
              liquidationThreshold: '0.75',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 137,
                address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
                decimals: 18,
                symbol: 'WMATIC',
                name: 'Wrapped Matic',
              },
              price: '0.75599807',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.65',
              liquidationThreshold: '0.7',
              isNotCollateral: false,
            },
          ],
          borrows: [
            {
              token: {
                chainId: 137,
                address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin (PoS)',
              },
              price: '0.99995719',
              balances: ['171.00092'],
              apys: ['0.042873641892576'],
            },
          ],
        },
      },
      {
        chainId: common.ChainId.arbitrum,
        marketId: logics.compoundv3.MarketId.USDCe,
        account: '0xA62315902fAADC69F898cc8B85F86FfD1F6aAeD8',
        blockTag: 130619502,
        expected: {
          chainId: 42161,
          protocolId: 'compound-v3',
          marketId: 'USDC.e',
          utilization: '0',
          healthRate: 'Infinity',
          netAPY: '0',
          totalSupplyUSD: '0.00000035857897846998967539',
          totalBorrowUSD: '0',
          supplies: [
            {
              token: {
                chainId: 42161,
                address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
                decimals: 6,
                symbol: 'USDC.e',
                name: 'USD Coin (Arb1)',
              },
              price: '0.99996426',
              balance: '0',
              apy: '0.025877463290208',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
              isNotCollateral: true,
            },
            {
              token: {
                chainId: 42161,
                address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
                decimals: 18,
                symbol: 'ARB',
                name: 'Arbitrum',
              },
              price: '0.77777613',
              balance: '0.000000461031091903',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.55',
              liquidationThreshold: '0.6',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 42161,
                address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
                decimals: 18,
                symbol: 'GMX',
                name: 'GMX',
              },
              price: '31.486851',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.4',
              liquidationThreshold: '0.45',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 42161,
                address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
                decimals: 18,
                symbol: 'WETH',
                name: 'Wrapped Ether',
              },
              price: '1588.58',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.78',
              liquidationThreshold: '0.85',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 42161,
                address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
                decimals: 8,
                symbol: 'WBTC',
                name: 'Wrapped BTC',
              },
              price: '25902.87584738',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.7',
              liquidationThreshold: '0.77',
              isNotCollateral: false,
            },
          ],
          borrows: [
            {
              token: {
                chainId: 42161,
                address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
                decimals: 6,
                symbol: 'USDC.e',
                name: 'USD Coin (Arb1)',
              },
              price: '0.99996426',
              balances: ['0'],
              apys: ['0.042868037377728'],
            },
          ],
        },
      },
      {
        chainId: common.ChainId.arbitrum,
        marketId: logics.compoundv3.MarketId.USDC,
        account: '0xA62315902fAADC69F898cc8B85F86FfD1F6aAeD8',
        blockTag: 130619502,
        expected: {
          chainId: 42161,
          protocolId: 'compound-v3',
          marketId: 'USDC',
          utilization: '0.75811587136392897001',
          healthRate: '1.45096553383190101788',
          netAPY: '-0.03003924035958431595',
          totalSupplyUSD: '1036374.0626536738',
          totalBorrowUSD: '549984.13789736552058',
          supplies: [
            {
              token: {
                chainId: 42161,
                address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin',
              },
              price: '0.99996426',
              balance: '0',
              apy: '0.010739697194304',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
              isNotCollateral: true,
            },
            {
              token: {
                chainId: 42161,
                address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
                decimals: 18,
                symbol: 'ARB',
                name: 'Arbitrum',
              },
              price: '0.77777613',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.55',
              liquidationThreshold: '0.6',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 42161,
                address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
                decimals: 18,
                symbol: 'GMX',
                name: 'GMX',
              },
              price: '31.486851',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.4',
              liquidationThreshold: '0.45',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 42161,
                address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
                decimals: 18,
                symbol: 'WETH',
                name: 'Wrapped Ether',
              },
              price: '1588.58',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.78',
              liquidationThreshold: '0.85',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 42161,
                address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
                decimals: 8,
                symbol: 'WBTC',
                name: 'Wrapped BTC',
              },
              price: '25902.87584738',
              balance: '40.01',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.7',
              liquidationThreshold: '0.77',
              isNotCollateral: false,
            },
          ],
          borrows: [
            {
              token: {
                chainId: 42161,
                address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin',
              },
              price: '0.99996426',
              balances: ['550003.795033'],
              apys: ['0.026565827723856'],
            },
          ],
        },
      },
    ];

    testCases.forEach(({ chainId, marketId, account, blockTag, expected }) => {
      it(`${common.toNetworkId(chainId)} ${marketId} market`, async function () {
        const protocol = new LendingProtocol(chainId);
        protocol.setBlockTag(blockTag);
        const portfolio = await protocol.getPortfolio(account, marketId);
        expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(expected));
      });
    });
  });

  context('Test canCollateralSwap', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        marketId: logics.compoundv3.MarketId.USDC,
        asset: mainnetTokens.USDC,
        expected: false,
      },
      {
        chainId: common.ChainId.mainnet,
        marketId: logics.compoundv3.MarketId.USDC,
        asset: mainnetTokens.WBTC,
        expected: true,
      },
      {
        chainId: common.ChainId.mainnet,
        marketId: logics.compoundv3.MarketId.ETH,
        asset: mainnetTokens.ETH,
        expected: false,
      },
      {
        chainId: common.ChainId.mainnet,
        marketId: logics.compoundv3.MarketId.ETH,
        asset: mainnetTokens.WETH,
        expected: false,
      },
      {
        chainId: common.ChainId.mainnet,
        marketId: logics.compoundv3.MarketId.ETH,
        asset: mainnetTokens.cbETH,
        expected: true,
      },
      {
        chainId: common.ChainId.polygon,
        marketId: logics.compoundv3.MarketId.USDC,
        asset: polygonTokens.USDC,
        expected: false,
      },
      {
        chainId: common.ChainId.polygon,
        marketId: logics.compoundv3.MarketId.USDC,
        asset: polygonTokens.WBTC,
        expected: true,
      },
      {
        chainId: common.ChainId.arbitrum,
        marketId: logics.compoundv3.MarketId.USDCe,
        asset: arbitrumTokens['USDC.e'],
        expected: false,
      },
      {
        chainId: common.ChainId.arbitrum,
        marketId: logics.compoundv3.MarketId.USDCe,
        asset: arbitrumTokens.WBTC,
        expected: true,
      },
      {
        chainId: common.ChainId.arbitrum,
        marketId: logics.compoundv3.MarketId.USDC,
        asset: arbitrumTokens.USDC,
        expected: false,
      },
      {
        chainId: common.ChainId.arbitrum,
        marketId: logics.compoundv3.MarketId.USDC,
        asset: arbitrumTokens.WBTC,
        expected: true,
      },
    ];

    testCases.forEach(({ chainId, marketId, asset, expected }) => {
      it(`${common.toNetworkId(chainId)} ${marketId} market - ${asset.symbol}`, async function () {
        const protocol = new LendingProtocol(chainId);
        expect(protocol.canCollateralSwap(marketId, asset)).to.eq(expected);
      });
    });
  });

  context('Test toUnderlyingToken, toProtocolToken', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        marketId: logics.compoundv3.MarketId.USDC,
        expected: [mainnetTokens.USDC, mainnetTokens.cUSDCv3],
      },
      {
        chainId: common.ChainId.mainnet,
        marketId: logics.compoundv3.MarketId.ETH,
        expected: [mainnetTokens.ETH, mainnetTokens.cWETHv3],
      },
      {
        chainId: common.ChainId.polygon,
        marketId: logics.compoundv3.MarketId.USDC,
        expected: [polygonTokens.USDC, polygonTokens.cUSDCv3],
      },
      {
        chainId: common.ChainId.arbitrum,
        marketId: logics.compoundv3.MarketId.USDCe,
        expected: [arbitrumTokens['USDC.e'], arbitrumTokens.cUSDCev3],
      },
      {
        chainId: common.ChainId.arbitrum,
        marketId: logics.compoundv3.MarketId.USDC,
        expected: [arbitrumTokens.USDC, arbitrumTokens.cUSDCv3],
      },
    ];

    testCases.forEach(({ chainId, marketId, expected }) => {
      it(`${common.toNetworkId(chainId)} ${marketId} market`, async function () {
        const protocol = new LendingProtocol(chainId);
        expect(protocol.toUnderlyingToken(marketId).is(expected[0])).to.be.true;
        expect(protocol.toProtocolToken(marketId).is(expected[1])).to.be.true;
      });
    });
  });
});
