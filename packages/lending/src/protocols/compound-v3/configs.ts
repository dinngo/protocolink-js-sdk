import { arbitrumTokens, mainnetTokens, polygonTokens } from './tokens';
import * as common from '@protocolink/common';
import { unwrapToken } from 'src/helper';

export const ID = 'compound-v3';
export const DISPLAY_NAME = 'Compound V3';

export interface AssetConfig {
  token: common.Token;
  priceFeedAddress: string;
  borrowCollateralFactor: string;
  liquidateCollateralFactor: string;
}

export interface MarketConfigBase {
  cometAddress: string;
  baseToken: common.Token;
  baseTokenPriceFeedAddress: string;
  baseTokenQuotePriceFeedAddress?: string;
}

export interface MarketConfig extends MarketConfigBase {
  assets: AssetConfig[];
  baseBorrowMin: string;
  utilization: string;
  numAssets: number;
}

export interface Config {
  chainId: number;
  markets: Pick<
    MarketConfig,
    'cometAddress' | 'baseToken' | 'baseTokenPriceFeedAddress' | 'baseTokenQuotePriceFeedAddress'
  >[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    markets: [
      {
        cometAddress: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
        baseToken: mainnetTokens.USDC,
        baseTokenPriceFeedAddress: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
      },
      {
        cometAddress: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
        baseToken: mainnetTokens.WETH,
        baseTokenPriceFeedAddress: '0xD72ac1bCE9177CFe7aEb5d0516a38c88a64cE0AB',
        // because the ETH market uses ETH price as the quote, we need to get the price of ETH separately.
        baseTokenQuotePriceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      },
    ],
  },
  {
    chainId: common.ChainId.polygon,
    markets: [
      {
        cometAddress: '0xF25212E676D1F7F89Cd72fFEe66158f541246445',
        baseToken: polygonTokens.USDC,
        baseTokenPriceFeedAddress: '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7',
      },
    ],
  },
  {
    chainId: common.ChainId.arbitrum,
    markets: [
      {
        cometAddress: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA',
        baseToken: arbitrumTokens.USDC, // USDC.e
        baseTokenPriceFeedAddress: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
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
