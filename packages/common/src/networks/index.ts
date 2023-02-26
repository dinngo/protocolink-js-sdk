import data from './data.json';

export interface Network {
  id: string;
  chainId: number;
  name: string;
  explorerUrl: string;
  rpcUrl: string;
  nativeToken: {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  };
  wrappedNativeToken: {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  };
  multicall2Address: string;
}

export const networks: Network[] = data;

export const networkMap = networks.reduce((accumulator, network) => {
  accumulator[network.chainId] = network;
  return accumulator;
}, {} as Record<number, Network>);

export function getNetwork(chainId: number) {
  return networkMap[chainId];
}

export function getNetworkId(chainId: number) {
  return getNetwork(chainId).id;
}

export enum ChainId {
  mainnet = 1,
  polygon = 137,
  arbitrum = 42161,
  optimism = 10,
  avalanche = 43114,
}

export enum NetworkId {
  mainnet = 'mainnet',
  polygon = 'polygon',
  arbitrum = 'arbitrum',
  optimism = 'optimism',
  avalanche = 'avalanche',
}

export function isSupportedChainId(chainId: number) {
  return networks.some((network) => network.chainId == chainId);
}

export function isSupportedNetworkId(networkId: string) {
  return networks.some((network) => network.id == networkId);
}
