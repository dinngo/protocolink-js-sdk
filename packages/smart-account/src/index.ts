import { Executor__factory } from './contracts';
import { getConfig, getExecutor, getExecutorId } from './configs';

export function getSmartIds(chainId: number) {
  return getExecutorId(chainId);
}

export function verifySmartId(chainId: number, id: string) {
  return !!getConfig(chainId) && !!getExecutor(chainId, id);
}

export function encodeSmartAccount(chainId: number, id: string, tos: string[], datas: string[], values: string[]) {
  const executor = getExecutor(chainId, id);
  const to = executor.address;
  const data = Executor__factory.createInterface().encodeFunctionData('executeFromAgent', [tos, datas, values]);
  return { to, data };
}
