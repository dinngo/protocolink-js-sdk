import * as common from '@protocolink/common';

type ContractNames = 'Router' | 'AgentImplementation';

export const contractAddressMap: Record<number, Record<ContractNames, string>> = {
  [common.ChainId.mainnet]: {
    Router: '0xf4dEf6B4389eAb49dF2a7D67890810e5249B5E70',
    AgentImplementation: '0xb16889e61Bdbb614fd5D995F5eDf7AEa02641400',
  },
  [common.ChainId.polygon]: {
    Router: '0xf4dEf6B4389eAb49dF2a7D67890810e5249B5E70',
    AgentImplementation: '0xb16889e61Bdbb614fd5D995F5eDf7AEa02641400',
  },
  [common.ChainId.arbitrum]: {
    Router: '0xf4dEf6B4389eAb49dF2a7D67890810e5249B5E70',
    AgentImplementation: '0xb16889e61Bdbb614fd5D995F5eDf7AEa02641400',
  },
  [common.ChainId.optimism]: {
    Router: '0xf4dEf6B4389eAb49dF2a7D67890810e5249B5E70',
    AgentImplementation: '0xb16889e61Bdbb614fd5D995F5eDf7AEa02641400',
  },
  [common.ChainId.avalanche]: {
    Router: '0xf4dEf6B4389eAb49dF2a7D67890810e5249B5E70',
    AgentImplementation: '0xb16889e61Bdbb614fd5D995F5eDf7AEa02641400',
  },
  [common.ChainId.fantom]: {
    Router: '0xf4dEf6B4389eAb49dF2a7D67890810e5249B5E70',
    AgentImplementation: '0xb16889e61Bdbb614fd5D995F5eDf7AEa02641400',
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
