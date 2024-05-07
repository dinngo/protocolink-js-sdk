import * as common from '@protocolink/common';

export enum SmartAccountId {
  PORTUS = '1',
}

export interface SmartAccountExecutor {
  id: string;
  address: string;
}

export interface Config {
  chainId: number;
  executors: SmartAccountExecutor[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.optimism,
    executors: [
      {
        id: SmartAccountId.PORTUS,
        address: '0xdD408b8eFb837EdeF8e6192Ed19f0dbEB7B79383',
      },
    ],
  },
];

export const [supportedChainIds, configMap, executorMap, executorIdMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    accumulator[2][config.chainId] = {};
    accumulator[3][config.chainId] = [];
    for (const executor of config.executors) {
      accumulator[2][config.chainId][executor.id] = executor;
      accumulator[3][config.chainId].push(executor.id);
    }

    return accumulator;
  },
  [[], {}, {}, {}] as [
    number[],
    Record<number, Config>,
    Record<number, Record<string, SmartAccountExecutor>>,
    Record<number, string[]>
  ]
);

export function getConfig(chainId: number) {
  return configMap[chainId];
}

export function getExecutorId(chainId: number) {
  return executorIdMap[chainId];
}

export function getExecutor(chainId: number, id: string) {
  return executorMap[chainId][id];
}
