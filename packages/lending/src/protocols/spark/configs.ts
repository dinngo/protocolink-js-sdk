import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export const ID = 'spark';
export const DISPLAY_NAME = 'Spark';

export type ReserveTokens = logics.aavev2.ReserveTokens;
export type ReserveMap = Record<string, ReserveTokens>;

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
