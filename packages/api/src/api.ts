import { Permit2Type, RouterData, RouterDataEstimateResult } from './types';
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

export interface Protocol {
  id: string;
  logics: { id: string; supportedChainIds: number[] }[];
}

export async function getProtocols(): Promise<Protocol[]> {
  const resp = await client.get('/v1/protocols');
  return resp.data.protocols;
}

export async function getProtocolTokenList(chainId: number, rid: string) {
  const resp = await client.get(`/v1/protocols/${chainId}/${rid.replace(/:/, '/')}/tokens`);
  return common.classifying(resp.data.tokens);
}

export async function quote(chainId: number, rid: string, data: any) {
  const resp = await client.post(`/v1/protocols/${chainId}/${rid.replace(/:/, '/')}/quote`, data);
  return common.classifying(resp.data);
}

export async function estimateRouterData(
  routerData: RouterData,
  options: { permit2Type?: Permit2Type; apiKey?: string } = {}
): Promise<RouterDataEstimateResult> {
  const resp = await client.post(
    `/v1/transactions/estimate${options.permit2Type ? `?permit2Type=${options.permit2Type}` : ''}`,
    routerData,
    options.apiKey ? { headers: { 'x-api-key': options.apiKey } } : undefined
  );
  return common.classifying(resp.data);
}

export async function buildRouterTransactionRequest(
  routerData: RouterData,
  options: { apiKey?: string } = {}
): Promise<common.TransactionRequest> {
  const resp = await client.post(
    '/v1/transactions/build',
    routerData,
    options.apiKey ? { headers: { 'x-api-key': options.apiKey } } : undefined
  );
  return resp.data;
}
