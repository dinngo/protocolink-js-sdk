import { BigNumberish } from 'ethers';
import { IRouter } from './contracts/Router';
import { Router__factory } from './contracts';
import * as common from '@composable-router/common';
import { getContractAddress } from './config';

export interface NewRouterExecuteTransactionOptions {
  chainId: number;
  routerLogics: IRouter.LogicStruct[];
  tokensReturn?: string[];
  value?: BigNumberish;
}

export function newRouterExecuteTransactionRequest(
  options: NewRouterExecuteTransactionOptions
): common.TransactionRequest {
  const { chainId, routerLogics, tokensReturn = [], value = 0 } = options;
  const iface = Router__factory.createInterface();
  const data = iface.encodeFunctionData('execute', [routerLogics, tokensReturn]);

  return { to: getContractAddress(chainId, 'Router'), data, value };
}
