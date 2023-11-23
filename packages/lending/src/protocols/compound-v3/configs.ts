import { arbitrumTokens, mainnetTokens, polygonTokens } from '@protocolink/test-helpers';
// import { SUPPLY_ETH_NAME, SUPPLY_USDC_NAME, WITHDRAW_ETH_NAME, WITHDRAW_USDC_NAME } from '../compoundv3/constants';
import * as common from '@protocolink/common';
import { unwrapToken, wrapToken } from 'src/helper';

export interface AssetConfig {
  token: common.Token;
  priceFeedAddress: string;
}

export interface MarketConfigBase {
  cometAddress: string;
  baseToken: common.Token;
  baseTokenPriceFeedAddress: string;
  baseTokenQuotePriceFeedAddress?: string;
  // supplyFeatureName: string;
  // withdrawFeatureName: string;
}

export interface MarketConfig extends MarketConfigBase {
  assets: AssetConfig[];
}

export interface Config {
  chainId: number;
  markets: MarketConfigBase[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    markets: [
      {
        cometAddress: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
        baseToken: mainnetTokens.USDC,
        baseTokenPriceFeedAddress: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
        // supplyFeatureName: SUPPLY_USDC_NAME,
        // withdrawFeatureName: WITHDRAW_USDC_NAME,
      },
      {
        cometAddress: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
        baseToken: mainnetTokens.WETH,
        baseTokenPriceFeedAddress: '0xD72ac1bCE9177CFe7aEb5d0516a38c88a64cE0AB',
        // because the ETH market uses ETH price as the quote, we need to get the price of ETH separately.
        baseTokenQuotePriceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        // supplyFeatureName: SUPPLY_ETH_NAME,
        // withdrawFeatureName: WITHDRAW_ETH_NAME,
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
        // supplyFeatureName: SUPPLY_USDC_NAME,
        // withdrawFeatureName: WITHDRAW_USDC_NAME,
      },
    ],
  },
  {
    chainId: common.ChainId.arbitrum,
    markets: [
      {
        cometAddress: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA',
        baseToken: arbitrumTokens['USDC.e'],
        baseTokenPriceFeedAddress: '0x50834f3163758fcc1df9973b6e91f0f0f0434ad3',
        // supplyFeatureName: SUPPLY_USDC_NAME,
        // withdrawFeatureName: WITHDRAW_USDC_NAME,
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
      accumulator[2][config.chainId][market.cometAddress] = market;
    }

    return accumulator;
  },
  [[], {}, {}] as [number[], Record<number, Config>, Record<number, Record<string, MarketConfigBase>>]
);

export function getMarketBaseConfig(chainId: number, id: string) {
  return marketMap[chainId][id];
}
