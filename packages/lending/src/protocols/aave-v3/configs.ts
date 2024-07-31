import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export const ID = 'aave-v3';
export const DISPLAY_NAME = 'Aave V3';

export type ReserveTokens = logics.aavev3.ReserveTokens;
export type ReserveMap = Record<string, ReserveTokens>;

type ContractName = 'Pool' | 'PoolDataProvider' | 'AaveOracle';

interface Config {
  chainId: number;
  contractMap: Record<ContractName, string>;
}

export const configs: Config[] = [
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Ethereum.sol
  {
    chainId: common.ChainId.mainnet,
    contractMap: {
      Pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      PoolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
      AaveOracle: '0x54586bE62E3c3580375aE3723C145253060Ca0C2',
    },
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Optimism.sol
  {
    chainId: common.ChainId.optimism,
    contractMap: {
      Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      PoolDataProvider: '0xd9Ca4878dd38B021583c1B669905592EAe76E044',
      AaveOracle: '0xD81eb3728a631871a7eBBaD631b5f424909f0c77',
    },
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Gnosis.sol
  {
    chainId: common.ChainId.gnosis,
    contractMap: {
      Pool: '0xb50201558B00496A145fE76f7424749556E326D8',
      PoolDataProvider: '0x501B4c19dd9C2e06E94dA7b6D5Ed4ddA013EC741',
      AaveOracle: '0xeb0a051be10228213BAEb449db63719d6742F7c4',
    },
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Polygon.sol
  {
    chainId: common.ChainId.polygon,
    contractMap: {
      Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      PoolDataProvider: '0x9441B65EE553F70df9C77d45d3283B6BC24F222d',
      AaveOracle: '0xb023e699F5a33916Ea823A16485e259257cA8Bd1',
    },
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Metis.sol
  {
    chainId: common.ChainId.metis,
    contractMap: {
      Pool: '0x90df02551bB792286e8D4f13E0e357b4Bf1D6a57',
      PoolDataProvider: '0x99411FC17Ad1B56f49719E3850B2CDcc0f9bBFd8',
      AaveOracle: '0x38D36e85E47eA6ff0d18B0adF12E5fC8984A6f8e',
    },
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Base.sol
  {
    chainId: common.ChainId.base,
    contractMap: {
      Pool: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
      PoolDataProvider: '0x2d8A3C5677189723C4cB8873CfC9C8976FDF38Ac',
      AaveOracle: '0x2Cc0Fc26eD4563A5ce5e8bdcfe1A2878676Ae156',
    },
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Arbitrum.sol
  {
    chainId: common.ChainId.arbitrum,
    contractMap: {
      Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      PoolDataProvider: '0x6b4E260b765B3cA1514e618C0215A6B7839fF93e',
      AaveOracle: '0xb56c2F0B653B2e0b10C9b928C8580Ac5Df02C7C7',
    },
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Avalanche.sol
  {
    chainId: common.ChainId.avalanche,
    contractMap: {
      Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      PoolDataProvider: '0x50ddd0Cd4266299527d25De9CBb55fE0EB8dAc30',
      AaveOracle: '0xEBd36016B3eD09D4693Ed4251c67Bd858c3c7C9C',
    },
  },
];

export const supportedChainIds = logics.aavev3.supportedChainIds;

export function getContractAddress(chainId: number, name: ContractName) {
  const { contractMap } = configs.find((configs) => configs.chainId === chainId)!;
  return contractMap[name];
}
