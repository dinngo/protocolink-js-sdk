import * as common from '@protocolink/common';

type ContractNames = 'Router';

export const contractAddressMap: Record<number, Record<ContractNames, string>> = {
  [common.ChainId.mainnet]: {
    Router: '0xDec80E988F4baF43be69c13711453013c212feA8',
  },
  [common.ChainId.optimism]: {
    Router: '0xDec80E988F4baF43be69c13711453013c212feA8',
  },
  [common.ChainId.gnosis]: {
    Router: '0xDec80E988F4baF43be69c13711453013c212feA8',
  },
  [common.ChainId.polygon]: {
    Router: '0xDec80E988F4baF43be69c13711453013c212feA8',
  },
  [common.ChainId.zksync]: {
    Router: '0xF0eD7De3cCc91682550cD178f1628830CDBcA237',
  },
  [common.ChainId.metis]: {
    Router: '0xDec80E988F4baF43be69c13711453013c212feA8',
  },
  [common.ChainId.base]: {
    Router: '0xDec80E988F4baF43be69c13711453013c212feA8',
  },
  [common.ChainId.arbitrum]: {
    Router: '0xDec80E988F4baF43be69c13711453013c212feA8',
  },
  [common.ChainId.avalanche]: {
    Router: '0xDec80E988F4baF43be69c13711453013c212feA8',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}
