import { Executor__factory } from './contracts';
import { getConfig, getExecutorId, getSmartAccount } from './configs';

export function getSmartAccountIds(chainId: number) {
  return getExecutorId(chainId);
}

export function isSupportedSmartAccountId(chainId: number, id: string) {
  return !!getConfig(chainId) && !!getSmartAccount(chainId, id);
}

export function encodeSmartAccount(chainId: number, id: string, tos: string[], datas: string[], values: string[]) {
  const smartAccount = getSmartAccount(chainId, id);
  const to = smartAccount.executor;
  const data = Executor__factory.createInterface().encodeFunctionData('executeFromAgent', [tos, datas, values]);
  return { to, data };
}
