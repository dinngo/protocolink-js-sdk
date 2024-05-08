import { Executor__factory } from './contracts';
import * as configs from './configs';

export function getSmartAccountIds(chainId: number) {
  return configs.getSmartAccountIds(chainId);
}

export function isSupportedSmartAccountId(chainId: number, id: string) {
  return !!configs.getConfig(chainId) && !!configs.getSmartAccount(chainId, id);
}

export function encodeSmartAccount(chainId: number, id: string, tos: string[], datas: string[], values: string[]) {
  const smartAccount = configs.getSmartAccount(chainId, id);
  const to = smartAccount.executor;
  const data = Executor__factory.createInterface().encodeFunctionData('executeFromAgent', [tos, datas, values]);
  return { to, data };
}
