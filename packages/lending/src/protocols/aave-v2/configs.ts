import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export const ID = 'aave-v2';
export const DISPLAY_NAME = 'Aave V2';

export interface Reserve {
  asset: common.Token;
  aToken: common.Token;
}

type ContractName = 'ProtocolDataProvider' | 'PriceOracle' | 'ETHPriceFeed';

interface Config {
  chainId: number;
  contractMap: Record<ContractName, string>;
}

export const configs: Config[] = [
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV2Ethereum.sol
  {
    chainId: common.ChainId.mainnet,
    contractMap: {
      ProtocolDataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
      PriceOracle: '0xA50ba011c48153De246E5192C8f9258A2ba79Ca9',
      ETHPriceFeed: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    },
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV2Polygon.sol
  {
    chainId: common.ChainId.polygon,
    contractMap: {
      ProtocolDataProvider: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
      PriceOracle: '0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d',
      ETHPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    },
  },
];

export const supportedChainIds = logics.aavev2.supportedChainIds;

export function getContractAddress(chainId: number, name: ContractName) {
  const { contractMap } = configs.find((configs) => configs.chainId === chainId)!;
  return contractMap[name];
}

const depositDisableMap: Record<number, string[]> = {
  [common.ChainId.mainnet]: [],
  [common.ChainId.polygon]: [],
};

const borrowDisableMap: Record<number, string[]> = {
  [common.ChainId.mainnet]: [common.mainnetTokens.AAVE.address, common.mainnetTokens.stETH.address],
  [common.ChainId.polygon]: [common.polygonTokens.AAVE.address],
};

export const isTokenForDeposit = (chainId: number, token: common.Token) => {
  return !depositDisableMap[chainId].includes(token.address);
};

export const isTokenForBorrow = (chainId: number, token: common.Token) => {
  return !borrowDisableMap[chainId].includes(token.address);
};
