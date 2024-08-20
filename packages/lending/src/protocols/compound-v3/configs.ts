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

export interface PriceFeedConfig {
  baseTokenPriceFeedAddress: string;
  baseTokenQuotePriceFeedAddress?: string;
}

export interface MarketConfig extends PriceFeedConfig {
  id: string;
  comet: common.Token;
  baseToken: common.Token;
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

const MarketId = logics.compoundv3.MarketId;

export const priceFeedMap: Record<number, Record<string, PriceFeedConfig>> = {
  [common.ChainId.mainnet]: {
    [MarketId.USDC]: {
      baseTokenPriceFeedAddress: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
    },
    [MarketId.ETH]: {
      baseTokenPriceFeedAddress: '0xD72ac1bCE9177CFe7aEb5d0516a38c88a64cE0AB',
      baseTokenQuotePriceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    },
  },
  [common.ChainId.optimism]: {
    [MarketId.USDC]: {
      baseTokenPriceFeedAddress: '0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3',
    },
  },
  [common.ChainId.polygon]: {
    [MarketId.USDCe]: {
      baseTokenPriceFeedAddress: '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7',
    },
  },
  [common.ChainId.base]: {
    [MarketId.USDC]: {
      baseTokenPriceFeedAddress: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B',
    },
    [MarketId.USDbC]: {
      baseTokenPriceFeedAddress: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B',
    },
    [MarketId.ETH]: {
      baseTokenPriceFeedAddress: '0x9f485610E26B9c0140439f88Dc0C7742903Bd1CF',
      baseTokenQuotePriceFeedAddress: '0x71041dddad3595f9ced3dccfbe3d1f4b0a16bb70',
    },
  },
  [common.ChainId.arbitrum]: {
    [MarketId.USDCe]: {
      baseTokenPriceFeedAddress: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
    },
    [MarketId.USDC]: {
      baseTokenPriceFeedAddress: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
    },
  },
};

export const supportedChainIds = logics.compoundv3.supportedChainIds;
export const configMap = logics.compoundv3.configMap;
export const marketMap = logics.compoundv3.marketMap;

export function getMarketConfig(chainId: number, id: string) {
  return { ...marketMap[chainId][id], ...priceFeedMap[chainId][id] };
}
