import * as common from '@protocolink/common';

type ContractNames = 'Router';

export const contractAddressMap: Record<number, Record<ContractNames, string>> = {
  [common.ChainId.mainnet]: {
    Router: '0x4E744c3E6973D34ee130B7E668Abc14CD49ca16e',
  },
  [common.ChainId.polygon]: {
    Router: '0x4E744c3E6973D34ee130B7E668Abc14CD49ca16e',
  },
  [common.ChainId.arbitrum]: {
    Router: '0x4E744c3E6973D34ee130B7E668Abc14CD49ca16e',
  },
  [common.ChainId.zksync]: {
    Router: '0xcfBdd89768f16125b48eE3FcD2BAb902ce0C447f',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}
