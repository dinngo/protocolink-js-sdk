import { SwapperQuoteFields, SwapperQuoteParams } from './swapper.type';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import { providers } from 'ethers';

export abstract class Swapper extends common.Web3Toolkit {
  static readonly supportedChainIds: number[];

  static isSupported(chainId: number) {
    return this.supportedChainIds.includes(chainId);
  }

  abstract readonly id: string;
  abstract readonly canCustomToken: boolean;

  abstract tokens(): Promise<common.Token[]>;

  // TODO: not implement
  isSupportedToken(_token: common.Token) {
    return true;
  }

  abstract quote(params: SwapperQuoteParams): Promise<SwapperQuoteFields>;

  abstract newSwapTokenLogic(fields: SwapperQuoteFields): apisdk.Logic;
}

export interface SwapperClass {
  new (chainId: number, library?: providers.Provider): Swapper;
  readonly supportedChainIds: number[];
  isSupported: (chainId: number) => boolean;
}
