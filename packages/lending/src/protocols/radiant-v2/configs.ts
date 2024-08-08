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
    chainId: common.ChainId.bnb,
    contractMap: {
      ProtocolDataProvider: '0x2f9D57E97C3DFED8676e605BC504a48E0c5917E9',
      PriceOracle: '0x0BB5c1Bc173b207cBf47CDf013617087776F3782',
    },
  },
  {
    chainId: common.ChainId.base,
    contractMap: {
      ProtocolDataProvider: '0x07d2DC09A1CbDD01e5f6Ca984b060A3Ff31b9EAF',
      PriceOracle: '0xe373749cd9b2D379f7f6Dd595e5164498b922164',
    },
  },
  {
    chainId: common.ChainId.arbitrum,
    contractMap: {
      ProtocolDataProvider: '0x596B0cc4c5094507C50b579a662FE7e7b094A2cC',
      PriceOracle: '0xC0cE5De939aaD880b0bdDcf9aB5750a53EDa454b',
    },
  },
];

export const supportedChainIds = logics.radiantv2.supportedChainIds;

export function getContractAddress(chainId: number, name: ContractName) {
  const { contractMap } = configs.find((configs) => configs.chainId === chainId)!;
  return contractMap[name];
}
