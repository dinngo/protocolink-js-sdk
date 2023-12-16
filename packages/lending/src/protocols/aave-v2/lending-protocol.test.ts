import { LendingProtocol } from './lending-protocol';
import * as common from '@protocolink/common';
import { expect } from 'chai';

describe('Test Aave V2 LendingProtocol', function () {
  context('Test getPortfolio', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        account: '0xc94680947CF2114ec8eE43725898EAA7269a98c5',
        blockTag: 18797586,
        expected: {
          chainId: 1,
          protocolId: 'aave-v2',
          marketId: 'mainnet',
          utilization: '0.84307014133511974015',
          healthRate: '1.35125085967495134596',
          netAPY: '0.00470040090095533412',
          totalSupplyUSD: '74630251.48508760401719470575176',
          totalBorrowUSD: '46349296.55097934829189739308277',
          supplies: [
            {
              token: {
                chainId: 1,
                address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
                decimals: 18,
                symbol: 'AAVE',
                name: 'Aave Token',
              },
              price: '105.14608582',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.66',
              liquidationThreshold: '0.73',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                decimals: 18,
                symbol: 'DAI',
                name: 'Dai Stablecoin',
              },
              price: '1.00070489',
              balance: '0',
              apy: '0.06039649841678908996',
              usageAsCollateralEnabled: true,
              ltv: '0.75',
              liquidationThreshold: '0.87',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0x0000000000000000000000000000000000000000',
                decimals: 18,
                symbol: 'ETH',
                name: 'Ethereum',
              },
              price: '2242.39893',
              balance: '0',
              apy: '0.00916817498078637062',
              usageAsCollateralEnabled: true,
              ltv: '0.825',
              liquidationThreshold: '0.86',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
                decimals: 18,
                symbol: 'FRAX',
                name: 'Frax',
              },
              price: '1.00993502',
              balance: '0',
              apy: '0.14450408118649581654',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
                decimals: 2,
                symbol: 'GUSD',
                name: 'Gemini dollar',
              },
              price: '0.99999999',
              balance: '0',
              apy: '0.02829120928712811107',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
                decimals: 18,
                symbol: 'LUSD',
                name: 'LUSD Stablecoin',
              },
              price: '0.99907345',
              balance: '0',
              apy: '0.02996184796985743881',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin',
              },
              price: '1.00052179',
              balance: '15529603.860255',
              apy: '0.09796037628587413794',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.875',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                decimals: 6,
                symbol: 'USDT',
                name: 'Tether USD',
              },
              price: '0.99311457',
              balance: '0',
              apy: '0.10457023515211070635',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
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
              price: '42011.50322746',
              balance: '30.41724088',
              apy: '0.00094330871348293318',
              usageAsCollateralEnabled: true,
              ltv: '0.72',
              liquidationThreshold: '0.82',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
                decimals: 18,
                symbol: 'sUSD',
                name: 'Synth sUSD',
              },
              price: '0.99932685',
              balance: '0',
              apy: '0.02081794981150289325',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
                decimals: 18,
                symbol: 'stETH',
                name: 'Liquid staked Ether 2.0',
              },
              price: '2242.39893',
              balance: '25782.508922011398440232',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.72',
              liquidationThreshold: '0.83',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 1,
                address: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
                decimals: 18,
                symbol: 'USDP',
                name: 'Pax Dollar',
              },
              price: '1.0104264',
              balance: '0',
              apy: '0.05535400343460365121',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
              isNotCollateral: false,
            },
          ],
          borrows: [
            {
              token: {
                chainId: 1,
                address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                decimals: 18,
                symbol: 'DAI',
                name: 'Dai Stablecoin',
              },
              price: '1.00070489',
              balances: ['0', '0'],
              apys: ['0.10158065859420624468', '0.18145426830819562538'],
            },
            {
              token: {
                chainId: 1,
                address: '0x0000000000000000000000000000000000000000',
                decimals: 18,
                symbol: 'ETH',
                name: 'Ethereum',
              },
              price: '2242.39893',
              balances: ['20669.514211273436654689', '0'],
              apys: ['0.02999728877370512305', '0.05188673488267816372'],
            },
            {
              token: {
                chainId: 1,
                address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
                decimals: 18,
                symbol: 'FRAX',
                name: 'Frax',
              },
              price: '1.00993502',
              balances: ['0', '0'],
              apys: ['0.25936546148419450341', '0'],
            },
            {
              token: {
                chainId: 1,
                address: '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
                decimals: 2,
                symbol: 'GUSD',
                name: 'Gemini dollar',
              },
              price: '0.99999999',
              balances: ['0', '0'],
              apys: ['0.05117565287470436699', '0.08320838673417758781'],
            },
            {
              token: {
                chainId: 1,
                address: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
                decimals: 18,
                symbol: 'LUSD',
                name: 'LUSD Stablecoin',
              },
              price: '0.99907345',
              balances: ['0', '0'],
              apys: ['0.05085053141729208478', '0.12731640593829602791'],
            },
            {
              token: {
                chainId: 1,
                address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin',
              },
              price: '1.00052179',
              balances: ['0', '0'],
              apys: ['0.14696721595796531729', '0.21789170720630730761'],
            },
            {
              token: {
                chainId: 1,
                address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                decimals: 6,
                symbol: 'USDT',
                name: 'Tether USD',
              },
              price: '0.99311457',
              balances: ['0', '0'],
              apys: ['0.17653443273802138059', '0.26184280408543500539'],
            },
            {
              token: {
                chainId: 1,
                address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
                decimals: 8,
                symbol: 'WBTC',
                name: 'Wrapped BTC',
              },
              price: '42011.50322746',
              balances: ['0', '0'],
              apys: ['0.00914108731315682107', '0.05416491221659208727'],
            },
            {
              token: {
                chainId: 1,
                address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
                decimals: 18,
                symbol: 'sUSD',
                name: 'Synth sUSD',
              },
              price: '0.99932685',
              balances: ['0', '0'],
              apys: ['0.04382440867161357293', '0'],
            },
            {
              token: {
                chainId: 1,
                address: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
                decimals: 18,
                symbol: 'USDP',
                name: 'Pax Dollar',
              },
              price: '1.0104264',
              balances: ['0', '0'],
              apys: ['0.08682285915403841519', '0'],
            },
          ],
        },
      },
      {
        chainId: common.ChainId.polygon,
        account: '0x4AaeE20543e118a5f86d626eD5b98e37B9835eBf',
        blockTag: 51191189,
        expected: {
          chainId: 137,
          protocolId: 'aave-v2',
          marketId: 'polygon',
          utilization: '0.29454376738009600321',
          healthRate: '3.63758697377540893102',
          netAPY: '-0.00177320962148269986',
          totalSupplyUSD: '3813747.035784604443609',
          totalBorrowUSD: '786320.79382826983928903503637136',
          supplies: [
            {
              token: {
                chainId: 137,
                address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
                decimals: 18,
                symbol: 'AAVE',
                name: 'Aave (PoS)',
              },
              price: '105.25610147',
              balance: '0',
              apy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.5',
              liquidationThreshold: '0.65',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 137,
                address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
                decimals: 18,
                symbol: 'DAI',
                name: '(PoS) Dai Stablecoin',
              },
              price: '0.99679794',
              balance: '0',
              apy: '0.12710541004444977537',
              usageAsCollateralEnabled: true,
              ltv: '0.75',
              liquidationThreshold: '0.8',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 137,
                address: '0x0000000000000000000000000000000000001010',
                decimals: 18,
                symbol: 'MATIC',
                name: 'Matic Token',
              },
              price: '0.85300841',
              balance: '0',
              apy: '0.00015134820365801307',
              usageAsCollateralEnabled: true,
              ltv: '0.65',
              liquidationThreshold: '0.7',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 137,
                address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin (PoS)',
              },
              price: '0.99664591',
              balance: '0',
              apy: '0.10613890696322769932',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.85',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 137,
                address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                decimals: 6,
                symbol: 'USDT',
                name: '(PoS) Tether USD',
              },
              price: '1.00213471',
              balance: '0',
              apy: '0.02085841506259266721',
              usageAsCollateralEnabled: false,
              ltv: '0',
              liquidationThreshold: '0',
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
              price: '42314.45587845',
              balance: '90.12870322',
              apy: '0.00000380199312269635',
              usageAsCollateralEnabled: true,
              ltv: '0.7',
              liquidationThreshold: '0.75',
              isNotCollateral: false,
            },
            {
              token: {
                chainId: 137,
                address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
                decimals: 18,
                symbol: 'WETH',
                name: 'Wrapped Ether',
              },
              price: '2247.22899356',
              balance: '0',
              apy: '0.00011636207541797941',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.825',
              isNotCollateral: false,
            },
          ],
          borrows: [
            {
              token: {
                chainId: 137,
                address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
                decimals: 18,
                symbol: 'DAI',
                name: '(PoS) Dai Stablecoin',
              },
              price: '0.99679794',
              balances: ['0', '0'],
              apys: ['0.3663000288250825464', '0.37865223049074572113'],
            },
            {
              token: {
                chainId: 137,
                address: '0x0000000000000000000000000000000000001010',
                decimals: 18,
                symbol: 'MATIC',
                name: 'Matic Token',
              },
              price: '0.85300841',
              balances: ['0', '0'],
              apys: ['0.00810929691081872582', '0.06551791773174595276'],
            },
            {
              token: {
                chainId: 137,
                address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin (PoS)',
              },
              price: '0.99664591',
              balances: ['0', '0'],
              apys: ['0.30465373581862477007', '0.31644861668842150708'],
            },
            {
              token: {
                chainId: 137,
                address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                decimals: 6,
                symbol: 'USDT',
                name: '(PoS) Tether USD',
              },
              price: '1.00213471',
              balances: ['0', '0'],
              apys: ['0.08512478209917298281', '0.09056399268994015216'],
            },
            {
              token: {
                chainId: 137,
                address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
                decimals: 8,
                symbol: 'WBTC',
                name: '(PoS) Wrapped BTC',
              },
              price: '42314.45587845',
              balances: ['0', '0'],
              apys: ['0.00165671673095521292', '0.03472776662670952444'],
            },
            {
              token: {
                chainId: 137,
                address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
                decimals: 18,
                symbol: 'WETH',
                name: 'Wrapped Ether',
              },
              price: '2247.22899356',
              balances: ['349.906839081228429756', '0'],
              apys: ['0.0068455027805655621', '0.04818012563917243535'],
            },
          ],
        },
      },
    ];

    testCases.forEach(({ chainId, account, blockTag, expected }) => {
      it(`${common.toNetworkId(chainId)} market`, async function () {
        const protocol = new LendingProtocol(chainId);
        protocol.setBlockTag(blockTag);
        const portfolio = await protocol.getPortfolio(account);
        expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(expected));
      });
    });
  });
});
