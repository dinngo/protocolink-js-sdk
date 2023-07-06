import * as common from '@protocolink/common';

type ContractNames = 'Router' | 'AgentImplementation';

export const contractAddressMap: Record<number, Record<ContractNames, string>> = {
  [common.ChainId.mainnet]: {
    Router: '0xdAAe399e32e3F6cE47cA96E3A5db09f65cAa575a',
    AgentImplementation: '0x57643471E23430E2FD6334CBA6aEd85c5cc57281',
  },
  [common.ChainId.polygon]: {
    Router: '0xdAAe399e32e3F6cE47cA96E3A5db09f65cAa575a',
    AgentImplementation: '0x57643471E23430E2FD6334CBA6aEd85c5cc57281',
  },
  [common.ChainId.arbitrum]: {
    Router: '0xdAAe399e32e3F6cE47cA96E3A5db09f65cAa575a',
    AgentImplementation: '0x57643471E23430E2FD6334CBA6aEd85c5cc57281',
  },
  [common.ChainId.optimism]: {
    Router: '',
    AgentImplementation: '',
  },
  [common.ChainId.avalanche]: {
    Router: '',
    AgentImplementation: '',
  },
  [common.ChainId.fantom]: {
    Router: '',
    AgentImplementation: '',
  },
  [common.ChainId.zksync]: {
    Router: '0x7a750DdEA5efcd9140418515D260B917705F5D1b',
    AgentImplementation: '0xfB79f9F8EC6EC0A891Eb87Ca4E1BeedfD8918a33',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}
