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
    Router: '0x9A179815c2A93684bfd249dE127f4019FBaEd689',
    AgentImplementation: '0xD65c1dE2BC556dC7c73bF0E6a928582E681797eb',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}
