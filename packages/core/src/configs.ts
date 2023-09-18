import * as common from '@protocolink/common';

type ContractNames = 'Router';

export const contractAddressMap: Record<number, Record<ContractNames, string>> = {
  [common.ChainId.mainnet]: {
    Router: '0x3fa3B62F0c9c13733245A778DE4157E47Cf5bA21',
  },
  [common.ChainId.polygon]: {
    Router: '0x3fa3B62F0c9c13733245A778DE4157E47Cf5bA21',
  },
  [common.ChainId.arbitrum]: {
    Router: '0x3fa3B62F0c9c13733245A778DE4157E47Cf5bA21',
  },
  [common.ChainId.zksync]: {
    Router: '0xa8350893B36e0425B50917125d9603F81F2D3C87',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}
