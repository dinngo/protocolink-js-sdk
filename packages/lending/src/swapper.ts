import { SwapTokenLogicParams } from './swapper.type';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';
import { providers } from 'ethers';

export abstract class Swapper extends common.Web3Toolkit {
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

  abstract quote(params: SwapTokenLogicParams): Promise<logics.paraswapv5.SwapTokenLogicFields>;

  abstract newSwapTokenLogic(fields: any): apisdk.protocols.paraswapv5.SwapTokenLogic;
}

export interface SwapperClass {
  new (chainId: number, library: providers.Provider): Swapper;
  readonly supportedChainIds: number[];
  isSupported: (chainId: number) => boolean;
}
