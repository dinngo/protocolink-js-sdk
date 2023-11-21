import { TokenToTokenParams } from './swaper.type';
import * as api from '@protocolink/api';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';
import { providers } from 'ethers';

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
