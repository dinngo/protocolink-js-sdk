import { arbitrumTokens, mainnetTokens, polygonTokens } from './tokens';
import * as common from '@protocolink/common';
import { unwrapToken } from 'src/helper';

export const ID = 'compound-v3';
export const DISPLAY_NAME = 'Compound V3';

export interface AssetConfig {
  token: common.Token;
  priceFeedAddress: string;
}

export interface MarketConfigBase {
  cometAddress: string;
  baseToken: common.Token;
  baseTokenPriceFeedAddress: string;
  baseTokenQuotePriceFeedAddress?: string;
}

export interface MarketConfig extends MarketConfigBase {
  assets: AssetConfig[];
}

export interface Config {
  chainId: number;
  markets: MarketConfig[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    markets: [
      {
        cometAddress: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
        baseToken: mainnetTokens.USDC,
        baseTokenPriceFeedAddress: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
        assets: [
          {
            token: mainnetTokens.COMP,
            priceFeedAddress: '0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5',
          },
          {
            token: mainnetTokens.WBTC,
            priceFeedAddress: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
          },
          {
            token: mainnetTokens.WETH,
            priceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
          },
          {
            token: mainnetTokens.ETH,
            priceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
          },
          {
            token: mainnetTokens.UNI,
            priceFeedAddress: '0x553303d460EE0afB37EdFf9bE42922D8FF63220e',
          },
          {
            token: mainnetTokens.LINK,
            priceFeedAddress: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
          },
        ],
      },
      {
        cometAddress: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
        baseToken: mainnetTokens.WETH,
        baseTokenPriceFeedAddress: '0xD72ac1bCE9177CFe7aEb5d0516a38c88a64cE0AB',
        // because the ETH market uses ETH price as the quote, we need to get the price of ETH separately.
        baseTokenQuotePriceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        assets: [
          {
            token: mainnetTokens.cbETH,
            priceFeedAddress: '0x23a982b74a3236A5F2297856d4391B2edBBB5549',
          },
          {
            token: mainnetTokens.wstETH,
            priceFeedAddress: '0x4F67e4d9BD67eFa28236013288737D39AeF48e79',
          },
        ],
      },
    ],
  },
  {
    chainId: common.ChainId.polygon,
    markets: [
      {
        cometAddress: '0xF25212E676D1F7F89Cd72fFEe66158f541246445',
        baseToken: polygonTokens.USDC,
        baseTokenPriceFeedAddress: '0xfe4a8cc5b5b2366c1b58bea3858e81843581b2f7',
        assets: [
          {
            token: polygonTokens.WETH,
            priceFeedAddress: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
          },
          {
            token: polygonTokens.WBTC,
            priceFeedAddress: '0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6',
          },
          {
            token: polygonTokens.WMATIC,
            priceFeedAddress: '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
          },
          {
            token: polygonTokens.MATIC,
            priceFeedAddress: '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
          },
          {
            token: polygonTokens.MaticX,
            priceFeedAddress: '0x5d37E4b374E6907de8Fc7fb33EE3b0af403C7403',
          },
          {
            token: polygonTokens.stMATIC,
            priceFeedAddress: '0x97371dF4492605486e23Da797fA68e55Fc38a13f',
          },
        ],
      },
    ],
  },
  {
    chainId: common.ChainId.arbitrum,
    markets: [
      {
        cometAddress: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA',
        baseToken: arbitrumTokens.USDC, // USDC.e
        baseTokenPriceFeedAddress: '0x50834f3163758fcc1df9973b6e91f0f0f0434ad3',
        assets: [
          {
            token: arbitrumTokens.ARB,
            priceFeedAddress: '0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6',
          },
          {
            token: arbitrumTokens.GMX,
            priceFeedAddress: '0xDB98056FecFff59D032aB628337A4887110df3dB',
          },
          {
            token: arbitrumTokens.WETH,
            priceFeedAddress: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
          },
          {
            token: arbitrumTokens.ETH,
            priceFeedAddress: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
          },
          {
            token: arbitrumTokens.WBTC,
            priceFeedAddress: '0xd0C7101eACbB49F3deCcCc166d238410D6D46d57',
          },
        ],
      },
    ],
  },
];

export const [supportedChainIds, configMap, marketMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    accumulator[2][config.chainId] = {};
    for (const market of config.markets) {
      accumulator[2][config.chainId][unwrapToken(config.chainId, market.baseToken).symbol] = market;
    }

    return accumulator;
  },
  [[], {}, {}] as [number[], Record<number, Config>, Record<number, Record<string, MarketConfigBase>>]
);

export function getMarketBaseConfig(chainId: number, id: string) {
  return marketMap[chainId][id];
}
