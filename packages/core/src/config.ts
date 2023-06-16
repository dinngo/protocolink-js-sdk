import * as common from '@furucombo/composable-router-common';

type ContractNames = 'Router' | 'AgentImplementation';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    Router: '0x67e4d4Af097787Aa5a7daE7f9b147Bf32243F030',
    AgentImplementation: '0xe495bDD1d9f74855D31BF881aA68b1bFeD728f7D',
  },
  [common.ChainId.polygon]: {
    Router: '0x67e4d4Af097787Aa5a7daE7f9b147Bf32243F030',
    AgentImplementation: '0xe495bDD1d9f74855D31BF881aA68b1bFeD728f7D',
  },
  [common.ChainId.arbitrum]: {
    Router: '0x67e4d4Af097787Aa5a7daE7f9b147Bf32243F030',
    AgentImplementation: '0xe495bDD1d9f74855D31BF881aA68b1bFeD728f7D',
  },
  [common.ChainId.optimism]: {
    Router: '0x67e4d4Af097787Aa5a7daE7f9b147Bf32243F030',
    AgentImplementation: '0xe495bDD1d9f74855D31BF881aA68b1bFeD728f7D',
  },
  [common.ChainId.avalanche]: {
    Router: '0x67e4d4Af097787Aa5a7daE7f9b147Bf32243F030',
    AgentImplementation: '0xe495bDD1d9f74855D31BF881aA68b1bFeD728f7D',
  },
  [common.ChainId.fantom]: {
    Router: '0x67e4d4Af097787Aa5a7daE7f9b147Bf32243F030',
    AgentImplementation: '0xe495bDD1d9f74855D31BF881aA68b1bFeD728f7D',
  },
  [common.ChainId.zksync]: {
    Router: '0x67e4d4Af097787Aa5a7daE7f9b147Bf32243F030',
    AgentImplementation: '0xe495bDD1d9f74855D31BF881aA68b1bFeD728f7D',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}
