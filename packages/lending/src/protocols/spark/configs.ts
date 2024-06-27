import * as common from '@protocolink/common';
import { gnosisTokens, mainnetTokens } from './tokens';
import * as logics from '@protocolink/logics';

export const ID = 'spark';
export const DISPLAY_NAME = 'Spark';

export interface Reserve {
  asset: common.Token;
  aToken: common.Token;
}

type ContractName = 'Pool' | 'PoolDataProvider' | 'AaveOracle';

interface Config {
  chainId: number;
  contractMap: Record<ContractName, string>;
}

export const configs: Config[] = [
  // https://devs.spark.fi/deployment-addresses/ethereum-addresses
  {
    chainId: common.ChainId.mainnet,
    contractMap: {
      Pool: '0xC13e21B648A5Ee794902342038FF3aDAB66BE987',
      PoolDataProvider: '0xFc21d6d146E6086B8359705C8b28512a983db0cb',
      AaveOracle: '0x8105f69D9C41644c6A0803fDA7D03Aa70996cFD9',
    },
  },
  // https://devs.spark.fi/deployment-addresses/gnosis-addresses
  {
    chainId: common.ChainId.gnosis,
    contractMap: {
      Pool: '0x2Dae5307c5E3FD1CF5A72Cb6F698f915860607e0',
      PoolDataProvider: '0x2a002054A06546bB5a264D57A81347e23Af91D18',
      AaveOracle: '0x8105f69D9C41644c6A0803fDA7D03Aa70996cFD9',
    },
  },
];

export const supportedChainIds = logics.spark.supportedChainIds;

export function getContractAddress(chainId: number, name: ContractName) {
  const { contractMap } = configs.find((configs) => configs.chainId === chainId)!;
  return contractMap[name];
}

const supplyDisabledMap: Record<number, string[]> = {
  [common.ChainId.mainnet]: [],
  [common.ChainId.gnosis]: [],
};

const borrowDisabledMap: Record<number, string[]> = {
  [common.ChainId.mainnet]: [mainnetTokens.sDAI.address],
  [common.ChainId.gnosis]: [gnosisTokens.GNO.address, gnosisTokens.sDAI.address],
};

export const isSupplyEnabled = (chainId: number, token: common.Token) => {
  return !supplyDisabledMap[chainId].includes(token.address);
};

export const isBorrowEnabled = (chainId: number, token: common.Token) => {
  return !borrowDisabledMap[chainId].includes(token.address);
};
