import * as common from '@protocolink/common';

export enum SmartAccountId {
  PORTUS = 'portus',
}

export interface SmartAccount {
  id: string;
  executor: string;
}

export interface Config {
  chainId: number;
  smartAccounts: SmartAccount[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.optimism,
    smartAccounts: [
      {
        id: SmartAccountId.PORTUS,
        executor: '0xdD408b8eFb837EdeF8e6192Ed19f0dbEB7B79383',
      },
    ],
  },
];

export const [supportedChainIds, configMap, smartAccountMap, smartAccountIdMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    accumulator[2][config.chainId] = {};
    accumulator[3][config.chainId] = [];
    for (const smartAccount of config.smartAccounts) {
      accumulator[2][config.chainId][smartAccount.id] = smartAccount;
      accumulator[3][config.chainId].push(smartAccount.id);
    }

    return accumulator;
  },
  [[], {}, {}, {}] as [
    number[],
    Record<number, Config>,
    Record<number, Record<string, SmartAccount>>,
    Record<number, string[]>
  ]
);

export function getConfig(chainId: number) {
  return configMap[chainId];
}

export function getSmartAccountIds(chainId: number) {
  return smartAccountIdMap[chainId];
}

export function getSmartAccount(chainId: number, id: string) {
  return smartAccountMap[chainId][id];
}
