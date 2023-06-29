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

export const [networkMap, networkMapById] = networks.reduce(
  (accumulator, network) => {
    accumulator[0][network.chainId] = network;
    accumulator[1][network.id] = network;
    return accumulator;
  },
  [{}, {}] as [Record<number, Network>, Record<string, Network>]
);

export function getNetwork(chainId: number) {
  return networkMap[chainId];
}

export function getNetworkId(chainId: number) {
  return getNetwork(chainId).id;
}

export function getChainId(networkId: number) {
  return getNetwork(networkId).chainId;
}

export function setNetwork(chainId: number, network: Partial<Network>) {
  for (let i = 0; i < networks.length; i++) {
    if (networks[i].chainId === chainId) {
      networks[i] = { ...networks[i], ...network };
      break;
    }
  }
  networkMap[chainId] = { ...networkMap[chainId], ...network };
}

export enum ChainId {
  mainnet = 1,
  polygon = 137,
  arbitrum = 42161,
  optimism = 10,
  avalanche = 43114,
  fantom = 250,
  zksync = 324,
}

export enum NetworkId {
  mainnet = 'mainnet',
  polygon = 'polygon',
  arbitrum = 'arbitrum',
  optimism = 'optimism',
  avalanche = 'avalanche',
  fantom = 'fantom',
  zksync = 'zksync',
}

export function isSupportedChainId(chainId: number) {
  return !!networkMap[chainId];
}

export function isSupportedNetworkId(networkId: string) {
  return networks.some((network) => network.id == networkId);
}

export enum ExplorerType {
  tx = 'tx',
  address = 'address',
  token = 'token',
}

export function newExplorerUrl(chainId: number, type: 'tx' | 'address' | 'token', data: string) {
  return `${getNetwork(chainId).explorerUrl}${type}/${data}`;
}
