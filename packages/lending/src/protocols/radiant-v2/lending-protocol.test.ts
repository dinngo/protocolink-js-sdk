import { LendingProtocol } from './lending-protocol';
import { Portfolio } from 'src/protocol.portfolio';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { filterPortfolio } from 'src/protocol.utils';
import { mainnetTokens } from './tokens';
import { supportedChainIds } from './configs';

describe('Test Radiant V2 LendingProtocol', function () {
  context('Test getReserveTokens', function () {
    supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const protocol = await LendingProtocol.createProtocol(chainId);

        const reserveTokensFromCache = await protocol.getReserveTokensFromCache();
        const reserveTokens = await protocol.getReserveTokens();

        expect(reserveTokensFromCache).to.have.lengthOf.above(0);
        expect(reserveTokens).to.have.lengthOf.above(0);
        expect(reserveTokensFromCache).to.deep.equal(reserveTokens);
      });
    });
  });

  context('Test getPortfolio', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        account: '0xaF184b4cBc73A9Ca2F51c4a4d80eD67a2578E9F4',
        blockTag: 20000000,
        expected: {
          chainId: 1,
          protocolId: 'radiant-v2',
          marketId: 'mainnet',
          utilization: '0.8174651291733022094',
          healthRate: '1.270424560536212322',
          totalSupplyUSD: '829174.29190796194925539907917736',
          totalBorrowUSD: '529970.4301314711752027658968675',
          supplies: [
            {
              token: mainnetTokens.USDT,
              price: '0.99912577',
              balance: '293244.926598',
              apy: '0.0321092011099533673',
              usageAsCollateralEnabled: true,
              ltv: '0.75',
              liquidationThreshold: '0.78',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '2525377.507712',
            },
            {
              token: mainnetTokens.USDC,
              price: '1.00005',
              balance: '20049.675786',
              apy: '0.03657940828520463137',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.83',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '4504945.241334',
            },
            {
              token: mainnetTokens.ETH,
              price: '3810.13582871',
              balance: '132.235914293417557263',
              apy: '0.05263157709475758322',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.83',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '2054.016615033045973535',
            },
            {
              token: mainnetTokens.WBTC,
              price: '67692.16439622',
              balance: '0.05664234',
              apy: '0.00815893596185290099',
              usageAsCollateralEnabled: true,
              ltv: '0.73',
              liquidationThreshold: '0.78',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '105.33192072',
            },
            {
              token: mainnetTokens.wstETH,
              price: '4451.7922676',
              balance: '1.256791116921100203',
              apy: '0.02168647903563481947',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.83',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '1760.709343166226626961',
            },
            {
              token: mainnetTokens.sDAI,
              price: '1.08594206',
              balance: '1444.334242869700584943',
              apy: '0.01897427303760700907',
              usageAsCollateralEnabled: true,
              ltv: '0.77',
              liquidationThreshold: '0.8',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '1605196.910728520564528363',
            },
            {
              token: mainnetTokens.rETH,
              price: '4220.13743235',
              balance: '0.308183515639294375',
              apy: '0.03616883757121200337',
              usageAsCollateralEnabled: true,
              ltv: '0.75',
              liquidationThreshold: '0.8',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '292.873865736590586357',
            },
            {
              token: mainnetTokens.weETH,
              price: '3961.56758438',
              balance: '0',
              apy: '0.00666986344642740114',
              usageAsCollateralEnabled: true,
              ltv: '0.67',
              liquidationThreshold: '0.75',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '35.01806263436514219',
            },
          ],
          borrows: [
            {
              token: mainnetTokens.USDT,
              price: '0.99912577',
              balance: '452611.289087',
              apy: '0.16109336527932400786',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '2138846.109957',
            },
            {
              token: mainnetTokens.USDC,
              price: '1.00005',
              balance: '0',
              apy: '0.18347518123312229154',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '3843979.682283',
            },
            {
              token: mainnetTokens.ETH,
              price: '3810.13582871',
              balance: '0',
              apy: '0.27583819933447551644',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '1730.40583256880497105',
            },
            {
              token: mainnetTokens.WBTC,
              price: '67692.16439622',
              balance: '1.13866282',
              apy: '0.07750245695701618442',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '45.88193036',
            },
            {
              token: mainnetTokens.wstETH,
              price: '4451.7922676',
              balance: '0',
              apy: '0.15774498701789162304',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '1031.805293209665710966',
            },
            {
              token: mainnetTokens.sDAI,
              price: '1.08594206',
              balance: '0',
              apy: '0.14079085887960466877',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '916777.759247472576730888',
            },
            {
              token: mainnetTokens.rETH,
              price: '4220.13743235',
              balance: '0.16024990163641505',
              apy: '0.25234882260325146882',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '185.077351228700433715',
            },
            {
              token: mainnetTokens.weETH,
              price: '3961.56758438',
              balance: '0',
              apy: '0.09342559864795353687',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '10.430224694196276706',
            },
          ],
        },
      },
      {
        chainId: common.ChainId.bnb,
        account: '0xA15aEF397F9Dc9dE23C8e3Df8A289B21D4cA8fCD',
        blockTag: 40750000,
        expected: {
          chainId: 56,
          protocolId: 'radiant-v2',
          marketId: 'bnb',
          utilization: '1',
          healthRate: '1.04397149107568892179',
          netAPY: '-0.14511936117721748453',
          totalSupplyUSD: '5420653.9101024398073132710459',
          totalBorrowUSD: '3894254.2658896485547761754501',
          supplies: [
            {
              token: {
                chainId: 56,
                address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
                decimals: 18,
                symbol: 'BTCB',
                name: 'BTCB Token',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/WBTC.svg',
              },
              price: '66423.8747',
              balance: '81.607011551592827365',
              apy: '0.00743715701231068815',
              lstApy: '0',
              grossApy: '0.00743715701231068815',
              usageAsCollateralEnabled: true,
              ltv: '0.7',
              liquidationThreshold: '0.75',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '314.713276593408263741',
            },
            {
              token: {
                chainId: 56,
                address: '0x55d398326f99059fF775485246999027B3197955',
                decimals: 18,
                symbol: 'USDT',
                name: 'Tether USD',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDT.svg',
              },
              price: '1.00009',
              balance: '0',
              apy: '0.02693578345076532001',
              lstApy: '0',
              grossApy: '0.02693578345076532001',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.85',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '5281559.447581482359161025',
            },
            {
              token: {
                chainId: 56,
                address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                decimals: 18,
                symbol: 'USDC',
                name: 'Binance-Peg USD Coin',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDC.svg',
              },
              price: '0.99999',
              balance: '0',
              apy: '0.0262962471792050187',
              lstApy: '0',
              grossApy: '0.0262962471792050187',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.85',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '611805.710651091785850711',
            },
            {
              token: {
                chainId: 56,
                address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
                decimals: 18,
                symbol: 'ETH',
                name: 'Binance-Peg Ethereum Token',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/ETH.png',
              },
              price: '3461.01',
              balance: '0.000000000657194888',
              apy: '0.00352224184639154924',
              lstApy: '0',
              grossApy: '0.00352224184639154924',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.825',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '855.67953711314166328',
            },
            {
              token: {
                chainId: 56,
                address: '0x0000000000000000000000000000000000000000',
                decimals: 18,
                symbol: 'BNB',
                name: 'BNB',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/BNB.svg',
              },
              price: '588.18732',
              balance: '0.00000026472977847',
              apy: '0.01068440988350536256',
              lstApy: '0',
              grossApy: '0.01068440988350536256',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.825',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '36986.018906083101779589',
            },
            {
              token: {
                chainId: 56,
                address: '0xa2E3356610840701BDf5611a53974510Ae27E2e1',
                decimals: 18,
                symbol: 'wBETH',
                name: 'Wrapped Binance Beacon ETH',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/wBETH.png',
              },
              price: '3613.1197149',
              balance: '0',
              apy: '0.00574667576360947439',
              lstApy: '0',
              grossApy: '0.00574667576360947439',
              usageAsCollateralEnabled: true,
              ltv: '0.67',
              liquidationThreshold: '0.75',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '347.372210704468812237',
            },
          ],
          borrows: [
            {
              token: {
                chainId: 56,
                address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
                decimals: 18,
                symbol: 'BTCB',
                name: 'BTCB Token',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/WBTC.svg',
              },
              price: '66423.8747',
              balance: '58.627327651056895583',
              apy: '0.06723351317914074627',
              lstApy: '0',
              grossApy: '0.06723351317914074627',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '143.348465059984868198',
            },
            {
              token: {
                chainId: 56,
                address: '0x55d398326f99059fF775485246999027B3197955',
                decimals: 18,
                symbol: 'USDT',
                name: 'Tether USD',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDT.svg',
              },
              price: '1.00009',
              balance: '0',
              apy: '0.15164317170302552927',
              lstApy: '0',
              grossApy: '0.15164317170302552927',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '3977149.60370022582825684',
            },
            {
              token: {
                chainId: 56,
                address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                decimals: 18,
                symbol: 'USDC',
                name: 'Binance-Peg USD Coin',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDC.svg',
              },
              price: '0.99999',
              balance: '0',
              apy: '0.14972799375318408806',
              lstApy: '0',
              grossApy: '0.14972799375318408806',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '455281.343824141725086861',
            },
            {
              token: {
                chainId: 56,
                address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
                decimals: 18,
                symbol: 'ETH',
                name: 'Binance-Peg Ethereum Token',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/ETH.png',
              },
              price: '3461.01',
              balance: '0',
              apy: '0.04425520372631329501',
              lstApy: '0',
              grossApy: '0.04425520372631329501',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '277.90834040502096607',
            },
            {
              token: {
                chainId: 56,
                address: '0x0000000000000000000000000000000000000000',
                decimals: 18,
                symbol: 'BNB',
                name: 'BNB',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/BNB.svg',
              },
              price: '588.18732',
              balance: '0',
              apy: '0.08911711348089979253',
              lstApy: '0',
              grossApy: '0.08911711348089979253',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '18418.239773461628669793',
            },
            {
              token: {
                chainId: 56,
                address: '0xa2E3356610840701BDf5611a53974510Ae27E2e1',
                decimals: 18,
                symbol: 'wBETH',
                name: 'Wrapped Binance Beacon ETH',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/wBETH.png',
              },
              price: '3613.1197149',
              balance: '0',
              apy: '0.08645846241079914598',
              lstApy: '0',
              grossApy: '0.08645846241079914598',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '96.022043455969143073',
            },
          ],
        },
      },
      {
        chainId: common.ChainId.base,
        account: '0x9edcb464C0AfdD01a5Ffbd09309b437C7dadeAB3',
        blockTag: 18120163,
        expected: {
          chainId: 8453,
          protocolId: 'radiant-v2',
          marketId: 'base',
          utilization: '0.97594074127235027564',
          healthRate: '1.07733803011741331794',
          netAPY: '-0.03481464542232050997',
          totalSupplyUSD: '4590032.02620769830265691392',
          totalBorrowUSD: '3359699.44359072674170386816',
          supplies: [
            {
              token: {
                chainId: 8453,
                address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDC.svg',
              },
              price: '0.99998066',
              balance: '2624732.79341',
              apy: '0.04111394015162770378',
              lstApy: '0',
              grossApy: '0.04111394015162770378',
              usageAsCollateralEnabled: true,
              ltv: '0.75',
              liquidationThreshold: '0.78',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '9560057.058265',
            },
            {
              token: {
                chainId: 8453,
                address: '0x0000000000000000000000000000000000000000',
                decimals: 18,
                symbol: 'ETH',
                name: 'Ethereum',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/ETH.png',
              },
              price: '2488.32',
              balance: '789.830084205376660581',
              apy: '0.01337705875613707169',
              lstApy: '0',
              grossApy: '0.01337705875613707169',
              usageAsCollateralEnabled: true,
              ltv: '0.75',
              liquidationThreshold: '0.8',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '8129.142689462643145709',
            },
            {
              token: {
                chainId: 8453,
                address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
                decimals: 18,
                symbol: 'wstETH',
                name: 'Wrapped liquid staked Ether 2.0',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/wstETH.png',
              },
              price: '2920.85258668',
              balance: '0',
              apy: '0.03928056355484533724',
              lstApy: '0.0393',
              grossApy: '0.07858056355484533724',
              usageAsCollateralEnabled: true,
              ltv: '0.67',
              liquidationThreshold: '0.75',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '312.260450840935964743',
            },
            {
              token: {
                chainId: 8453,
                address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
                decimals: 18,
                symbol: 'cbETH',
                name: 'Coinbase Wrapped Staked ETH',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/cbETH.svg',
              },
              price: '2690.48906329',
              balance: '0',
              apy: '0.0189445487943499782',
              lstApy: '0.0265',
              grossApy: '0.0454445487943499782',
              usageAsCollateralEnabled: true,
              ltv: '0.67',
              liquidationThreshold: '0.75',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '138.360174171412542732',
            },
            {
              token: {
                chainId: 8453,
                address: '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A',
                decimals: 18,
                symbol: 'weETH.base',
                name: 'Wrapped eETH',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/weETH.webp',
              },
              price: '2595.36784087',
              balance: '0',
              apy: '0.04552578544790765614',
              lstApy: '0',
              grossApy: '0.04552578544790765614',
              usageAsCollateralEnabled: true,
              ltv: '0.725',
              liquidationThreshold: '0.75',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '1199.968269605715778957',
            },
          ],
          borrows: [
            {
              token: {
                chainId: 8453,
                address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDC.svg',
              },
              price: '0.99998066',
              balance: '1857717.797787',
              apy: '0.07604798147502675701',
              lstApy: '0',
              grossApy: '0.07604798147502675701',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '7007050.525566',
            },
            {
              token: {
                chainId: 8453,
                address: '0x0000000000000000000000000000000000000000',
                decimals: 18,
                symbol: 'ETH',
                name: 'Ethereum',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/ETH.png',
              },
              price: '2488.32',
              balance: '603.627175791673073513',
              apy: '0.02380948075223016378',
              lstApy: '0',
              grossApy: '0.02380948075223016378',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '6121.04003673277607463',
            },
            {
              token: {
                chainId: 8453,
                address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
                decimals: 18,
                symbol: 'wstETH',
                name: 'Wrapped liquid staked Ether 2.0',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/wstETH.png',
              },
              price: '2920.85258668',
              balance: '0',
              apy: '0.1489032021641228095',
              lstApy: '0.0393',
              grossApy: '0.1096032021641228095',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '144.460218937944633066',
            },
            {
              token: {
                chainId: 8453,
                address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
                decimals: 18,
                symbol: 'cbETH',
                name: 'Coinbase Wrapped Staked ETH',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/cbETH.svg',
              },
              price: '2690.48906329',
              balance: '0',
              apy: '0.07224426117298718825',
              lstApy: '0.0265',
              grossApy: '0.04574426117298718825',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '62.044417717798044557',
            },
            {
              token: {
                chainId: 8453,
                address: '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A',
                decimals: 18,
                symbol: 'weETH.base',
                name: 'Wrapped eETH',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/weETH.webp',
              },
              price: '2595.36784087',
              balance: '0',
              apy: '0.23679317176320452079',
              lstApy: '0',
              grossApy: '0.23679317176320452079',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '457.044476739294122324',
            },
          ],
        },
      },
      {
        chainId: common.ChainId.arbitrum,
        account: '0xBf891E7eFCC98A8239385D3172bA10AD593c7886',
        blockTag: 240538430,
        expected: {
          chainId: 42161,
          protocolId: 'radiant-v2',
          marketId: 'arbitrum',
          utilization: '0',
          healthRate: 'Infinity',
          netAPY: '0.01608403244098665513',
          totalSupplyUSD: '1247.37902056836726397194132474',
          totalBorrowUSD: '0',
          supplies: [
            {
              token: {
                chainId: 42161,
                address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
                decimals: 8,
                symbol: 'WBTC',
                name: 'Wrapped BTC',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/WBTC.svg',
              },
              price: '55091.25104704',
              balance: '0.00424157',
              apy: '0.00278346150262042726',
              lstApy: '0',
              grossApy: '0.00278346150262042726',
              usageAsCollateralEnabled: true,
              ltv: '0.7',
              liquidationThreshold: '0.75',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '316.622157',
            },
            {
              token: {
                chainId: 42161,
                address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
                decimals: 6,
                symbol: 'USDT',
                name: 'Tether USD',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDT.svg',
              },
              price: '1.00056999',
              balance: '207.439073',
              apy: '0.02162418670424259118',
              lstApy: '0',
              grossApy: '0.02162418670424259118',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.85',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '1876226.421864',
            },
            {
              token: {
                chainId: 42161,
                address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
                decimals: 6,
                symbol: 'USDC.e',
                name: 'Bridged USDC',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDC.svg',
              },
              price: '0.99996',
              balance: '174.432611',
              apy: '0.02583192676078081026',
              lstApy: '0',
              grossApy: '0.02583192676078081026',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.85',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '1971023.208159',
            },
            {
              token: {
                chainId: 42161,
                address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
                decimals: 18,
                symbol: 'DAI',
                name: 'Dai Stablecoin',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/DAI.png',
              },
              price: '0.99989041',
              balance: '6.364521886000299753',
              apy: '0.01995301546244320957',
              lstApy: '0',
              grossApy: '0.01995301546244320957',
              usageAsCollateralEnabled: true,
              ltv: '0.75',
              liquidationThreshold: '0.85',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '158179.855197365680829642',
            },
            {
              token: {
                chainId: 42161,
                address: '0x0000000000000000000000000000000000000000',
                decimals: 18,
                symbol: 'ETH',
                name: 'Ethereum',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/ETH.png',
              },
              price: '2338.27637465',
              balance: '0.000000006108340273',
              apy: '0.0224127985265405239',
              lstApy: '0',
              grossApy: '0.0224127985265405239',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.825',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '5371.550820719381973195',
            },
            {
              token: {
                chainId: 42161,
                address: '0x5979D7b546E38E414F7E9822514be443A4800529',
                decimals: 18,
                symbol: 'wstETH',
                name: 'Wrapped liquid staked Ether 2.0',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/wstETH.png',
              },
              price: '2741.53670062',
              balance: '0',
              apy: '0.00183191600171452658',
              lstApy: '0.0393',
              grossApy: '0.04113191600171452658',
              usageAsCollateralEnabled: true,
              ltv: '0.7',
              liquidationThreshold: '0.8',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '3299.042410087712344693',
            },
            {
              token: {
                chainId: 42161,
                address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
                decimals: 18,
                symbol: 'ARB',
                name: 'Arbitrum',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/ARB.svg',
              },
              price: '0.48388682',
              balance: '226.544681647497610108',
              apy: '0.00509301706068117916',
              lstApy: '0',
              grossApy: '0.00509301706068117916',
              usageAsCollateralEnabled: true,
              ltv: '0.58',
              liquidationThreshold: '0.63',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '5548094.187766037092919883',
            },
            {
              token: {
                chainId: 42161,
                address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDC.svg',
              },
              price: '0.99996',
              balance: '515.757484',
              apy: '0.01887235896161830475',
              lstApy: '0',
              grossApy: '0.01887235896161830475',
              usageAsCollateralEnabled: true,
              ltv: '0.8',
              liquidationThreshold: '0.85',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '11915638.177696',
            },
            {
              token: {
                chainId: 42161,
                address: '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe',
                decimals: 18,
                symbol: 'weETH',
                name: 'Wrapped eETH',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/weETH.webp',
              },
              price: '2443.1050928',
              balance: '0',
              apy: '0.00513822361061825532',
              lstApy: '0',
              grossApy: '0.00513822361061825532',
              usageAsCollateralEnabled: true,
              ltv: '0.725',
              liquidationThreshold: '0.75',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '6801.029528047257764124',
            },
            {
              token: {
                chainId: 42161,
                address: '0x47c031236e19d024b42f8AE6780E44A573170703',
                decimals: 18,
                symbol: 'GM',
                name: 'GMX Market',
              },
              price: '1.60323689',
              balance: '0',
              apy: '0',
              lstApy: '0',
              grossApy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.55',
              liquidationThreshold: '0.6',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '2681048.616481888392063601',
            },
            {
              token: {
                chainId: 42161,
                address: '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336',
                decimals: 18,
                symbol: 'GM',
                name: 'GMX Market',
              },
              price: '1.36159657',
              balance: '0',
              apy: '0',
              lstApy: '0',
              grossApy: '0',
              usageAsCollateralEnabled: true,
              ltv: '0.6',
              liquidationThreshold: '0.65',
              isNotCollateral: false,
              supplyCap: '0',
              totalSupply: '2560989.075801604975633329',
            },
          ],
          borrows: [
            {
              token: {
                chainId: 42161,
                address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
                decimals: 8,
                symbol: 'WBTC',
                name: 'Wrapped BTC',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/WBTC.svg',
              },
              price: '55091.25104704',
              balance: '0',
              apy: '0.04065880856432899799',
              lstApy: '0',
              grossApy: '0.04065880856432899799',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '88.33133082',
            },
            {
              token: {
                chainId: 42161,
                address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
                decimals: 6,
                symbol: 'USDT',
                name: 'Tether USD',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDT.svg',
              },
              price: '1.00056999',
              balance: '0',
              apy: '0.13075765508042691977',
              lstApy: '0',
              grossApy: '0.13075765508042691977',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '1306540.895028',
            },
            {
              token: {
                chainId: 42161,
                address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
                decimals: 6,
                symbol: 'USDC.e',
                name: 'Bridged USDC',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDC.svg',
              },
              price: '0.99996',
              balance: '0',
              apy: '0.14359223131419108352',
              lstApy: '0',
              grossApy: '0.14359223131419108352',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '1498619.40566',
            },
            {
              token: {
                chainId: 42161,
                address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
                decimals: 18,
                symbol: 'DAI',
                name: 'Dai Stablecoin',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/DAI.png',
              },
              price: '0.99989041',
              balance: '0',
              apy: '0.12534806092408453499',
              lstApy: '0',
              grossApy: '0.12534806092408453499',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '105856.258321292178033422',
            },
            {
              token: {
                chainId: 42161,
                address: '0x0000000000000000000000000000000000000000',
                decimals: 18,
                symbol: 'ETH',
                name: 'Ethereum',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/ETH.png',
              },
              price: '2338.27637465',
              balance: '0',
              apy: '0.11685938669497102683',
              lstApy: '0',
              grossApy: '0.11685938669497102683',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '4309.141384846083206093',
            },
            {
              token: {
                chainId: 42161,
                address: '0x5979D7b546E38E414F7E9822514be443A4800529',
                decimals: 18,
                symbol: 'wstETH',
                name: 'Wrapped liquid staked Ether 2.0',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/wstETH.png',
              },
              price: '2741.53670062',
              balance: '0',
              apy: '0.04798007357984660386',
              lstApy: '0.0393',
              grossApy: '0.00868007357984660386',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '515.362511464058851526',
            },
            {
              token: {
                chainId: 42161,
                address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
                decimals: 18,
                symbol: 'ARB',
                name: 'Arbitrum',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/ARB.svg',
              },
              price: '0.48388682',
              balance: '0',
              apy: '0.08120654447327119351',
              lstApy: '0',
              grossApy: '0.08120654447327119351',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '1443939.765946457196475288',
            },
            {
              token: {
                chainId: 42161,
                address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                decimals: 6,
                symbol: 'USDC',
                name: 'USD Coin',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/USDC.svg',
              },
              price: '0.99996',
              balance: '0',
              apy: '0.09507294157148012505',
              lstApy: '0',
              grossApy: '0.09507294157148012505',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '6132415.706398',
            },
            {
              token: {
                chainId: 42161,
                address: '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe',
                decimals: 18,
                symbol: 'weETH',
                name: 'Wrapped eETH',
                logoUri: 'https://cdn.furucombo.app/assets/img/token/weETH.webp',
              },
              price: '2443.1050928',
              balance: '0',
              apy: '0.05503372814954214796',
              lstApy: '0',
              grossApy: '0.05503372814954214796',
              borrowMin: '0',
              borrowCap: '0',
              totalBorrow: '2602.51176195396985835',
            },
          ],
        },
      },
    ];

    testCases.forEach(({ chainId, account, blockTag, expected }) => {
      it(`${common.toNetworkId(chainId)} market with blockTag ${blockTag}`, async function () {
        const protocol = await LendingProtocol.createProtocol(chainId);

        protocol.setBlockTag(blockTag);
        const _portfolio = await protocol.getPortfolio(account);
        const portfolio: Portfolio = JSON.parse(JSON.stringify(_portfolio));

        const filteredPortfolio = filterPortfolio(portfolio);
        const filteredExpected = filterPortfolio(expected);

        expect(filteredPortfolio).to.deep.equal(filteredExpected);
      });
    });
  });
});
