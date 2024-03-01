import { arbitrumTokens, baseTokens, mainnetTokens, polygonTokens } from './tokens';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export const ID = 'compound-v3';
export const DISPLAY_NAME = 'Compound V3';

export interface AssetConfig {
  token: common.Token;
  priceFeedAddress: string;
  borrowCollateralFactor: string;
  liquidateCollateralFactor: string;
  totalSupply: string;
  supplyCap: string;
}

export interface MarketConfig {
  id: string;
  cometAddress: string;
  cToken: common.Token;
  baseToken: common.Token;
  baseTokenPriceFeedAddress: string;
  baseTokenQuotePriceFeedAddress?: string;
}

export interface MarketInfo extends MarketConfig {
  assets: AssetConfig[];
  baseBorrowMin: string;
  utilization: string;
  numAssets: number;
  totalSupply: string;
  totalBorrow: string;
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
        id: logics.compoundv3.MarketId.USDC,
        cometAddress: mainnetTokens.cUSDCv3.address,
        cToken: mainnetTokens.cUSDCv3,
        baseToken: mainnetTokens.USDC,
        baseTokenPriceFeedAddress: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
      },
      {
        id: logics.compoundv3.MarketId.ETH,
        cometAddress: mainnetTokens.cWETHv3.address,
        cToken: mainnetTokens.cWETHv3,
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
        id: logics.compoundv3.MarketId.USDCe,
        cometAddress: polygonTokens.cUSDCv3.address,
        cToken: polygonTokens.cUSDCv3,
        baseToken: polygonTokens['USDC.e'],
        baseTokenPriceFeedAddress: '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7',
      },
    ],
  },
  {
    chainId: common.ChainId.base,
    markets: [
      {
        id: logics.compoundv3.MarketId.USDbC,
        cometAddress: baseTokens.cUSDbCv3.address,
        cToken: baseTokens.cUSDbCv3,
        baseToken: baseTokens.USDbC,
        baseTokenPriceFeedAddress: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B', // USDC price feed
      },
      {
        id: logics.compoundv3.MarketId.ETH,
        cometAddress: baseTokens.cWETHv3.address,
        cToken: baseTokens.cWETHv3,
        baseToken: baseTokens.WETH,
        baseTokenPriceFeedAddress: '0x9f485610E26B9c0140439f88Dc0C7742903Bd1CF', // ETH price feed
        // because the ETH market uses ETH price as the quote, we need to get the price of ETH separately.
        baseTokenQuotePriceFeedAddress: '0x71041dddad3595f9ced3dccfbe3d1f4b0a16bb70',
      },
    ],
  },
  {
    chainId: common.ChainId.arbitrum,
    markets: [
      {
        id: logics.compoundv3.MarketId.USDCe,
        cometAddress: arbitrumTokens.cUSDCev3.address,
        cToken: arbitrumTokens.cUSDCev3,
        baseToken: arbitrumTokens['USDC.e'],
        baseTokenPriceFeedAddress: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
      },
      {
        id: logics.compoundv3.MarketId.USDC,
        cometAddress: arbitrumTokens.cUSDCv3.address,
        cToken: arbitrumTokens.cUSDCv3,
        baseToken: arbitrumTokens.USDC,
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
      accumulator[2][config.chainId][market.id] = market;
    }

    return accumulator;
  },
  [[], {}, {}] as [number[], Record<number, Config>, Record<number, Record<string, MarketConfig>>]
);

export function getMarketConfig(chainId: number, id: string) {
  return marketMap[chainId][id];
}
