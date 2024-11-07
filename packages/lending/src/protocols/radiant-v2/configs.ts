import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export const ID = 'radiant-v2';
export const DISPLAY_NAME = 'Radiant V2';

export type ReserveTokens = logics.radiantv2.ReserveTokens;
export type ReserveMap = Record<string, ReserveTokens>;

type ContractName = 'ProtocolDataProvider' | 'PriceOracle';

interface Config {
  chainId: number;
  contractMap: Record<ContractName, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contractMap: {
      ProtocolDataProvider: '0x362f3BB63Cff83bd169aE1793979E9e537993813',
      PriceOracle: '0xbD60293fBe4B285402510562A64E5fCEE9c4a8F9',
    },
  },
  {
    chainId: common.ChainId.base,
    contractMap: {
      ProtocolDataProvider: '0x07d2DC09A1CbDD01e5f6Ca984b060A3Ff31b9EAF',
      PriceOracle: '0xe373749cd9b2D379f7f6Dd595e5164498b922164',
    },
  },
];

export const supportedChainIds = logics.radiantv2.supportedChainIds;

export function getContractAddress(chainId: number, name: ContractName) {
  const { contractMap } = configs.find((configs) => configs.chainId === chainId)!;
  return contractMap[name];
}
