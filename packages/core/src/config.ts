import * as common from '@furucombo/composable-router-common';

type ContractNames = 'Router' | 'AgentImplementation';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
    AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
  },
  [common.ChainId.polygon]: {
    Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
    AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
  },
  [common.ChainId.arbitrum]: {
    Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
    AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
  },
  [common.ChainId.optimism]: {
    Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
    AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
  },
  [common.ChainId.avalanche]: {
    Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
    AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
  },
  [common.ChainId.fantom]: {
    Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
    AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}
