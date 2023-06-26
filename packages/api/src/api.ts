import { RouterData, RouterDataEstimateResult } from './types';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { classifying } from './utils';
import * as common from '@protocolink/common';

const client = axios.create({
  baseURL: 'https://3hii9fl6i5.execute-api.us-east-1.amazonaws.com/beta',
});

axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export { client };

export async function getProtocolTokenList(chainId: number, rid: string) {
  const resp = await client.get(`/v1/protocols/${chainId}/${rid.replace(/:/, '/')}/tokens`);
  return classifying(resp.data.tokens);
}

export async function quote(chainId: number, rid: string, data: any) {
  const resp = await client.post(`/v1/protocols/${chainId}/${rid.replace(/:/, '/')}/quote`, data);
  return classifying(resp.data);
}

export async function estimateRouterData(routerData: RouterData): Promise<RouterDataEstimateResult> {
  const resp = await client.post('/v1/transactions?isEstimate=true', routerData);
  return classifying(resp.data);
}

export async function buildRouterTransactionRequest(routerData: RouterData): Promise<common.TransactionRequest> {
  const resp = await client.post('/v1/transactions', routerData);
  return resp.data;
}
