import { RouterData, RouterDataEstimateResult } from './types';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as common from '@protocolink/common';

const client = axios.create({ baseURL: 'https://api.protocolink.com' });

axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

interface InitOptions {
  baseURL?: string;
}

export function init(options: InitOptions) {
  if (options.baseURL) {
    client.defaults.baseURL = options.baseURL;
  }
}

export { client };

export async function getProtocolTokenList(chainId: number, rid: string) {
  const resp = await client.get(`/v1/protocols/${chainId}/${rid.replace(/:/, '/')}/tokens`);
  return common.classifying(resp.data.tokens);
}

export async function quote(chainId: number, rid: string, data: any) {
  const resp = await client.post(`/v1/protocols/${chainId}/${rid.replace(/:/, '/')}/quote`, data);
  return common.classifying(resp.data);
}

export async function estimateRouterData(routerData: RouterData): Promise<RouterDataEstimateResult> {
  const resp = await client.post('/v1/transactions/estimate', routerData);
  return common.classifying(resp.data);
}

export async function buildRouterTransactionRequest(routerData: RouterData): Promise<common.TransactionRequest> {
  const resp = await client.post('/v1/transactions/build', routerData);
  return resp.data;
}
