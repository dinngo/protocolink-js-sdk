import { providers } from 'ethers';
import { TokenToTokenParams } from './swaper.types';
import * as common from '@protocolink/common';
import * as api from '@protocolink/api';
import * as logics from '@protocolink/logics';

export abstract class Swaper extends common.Web3Toolkit {
  static readonly supportedChainIds: number[];

  static isSupported(chainId: number) {
    return this.supportedChainIds.includes(chainId);
  }

  abstract readonly id: string;
  abstract readonly canCustomToken: boolean;

  abstract tokens(): Promise<common.Token[]>;

  isSupportedToken(token: common.Token) {
    return true;
  }

  abstract quote(params: TokenToTokenParams): Promise<logics.paraswapv5.SwapTokenLogicFields>;

  abstract newSwapTokenLogic(fields: any): api.protocols.paraswapv5.SwapTokenLogic;

  abstract isExactIn(logic: api.protocols.paraswapv5.SwapTokenLogic): boolean;
}

export interface SwaperClass {
  new (chainId: number, library: providers.Provider): Swaper;
  readonly supportedChainIds: number[];
  isSupported: (chainId: number) => boolean;
}
