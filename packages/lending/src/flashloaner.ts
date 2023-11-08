import { FlashLoanFields, FlashLoanLogic } from '@protocolink/api';
import * as api from '@protocolink/api';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';
import { providers } from 'ethers';

export abstract class FlashLoaner extends common.Web3Toolkit {
  static readonly supportedChainIds: number[];

  static isSupported(chainId: number) {
    return this.supportedChainIds.includes(chainId);
  }

  abstract readonly id: string;
  abstract readonly feeBps: number;

  abstract get tokens(): common.Token[];

  private _tokenMap: Record<string, common.Token> = {};

  get tokenMap() {
    if (Object.keys(this._tokenMap).length === 0) {
      for (const token of this.tokens) {
        this._tokenMap[token.address] = token;
      }
    }
    return this._tokenMap;
  }

  isSupportedToken(token: common.Token) {
    return !!this.tokenMap[token.address];
  }

  abstract quote(params: api.protocols.aavev3.FlashLoanParams): Promise<logics.aavev3.FlashLoanLogicQuotation>;

  abstract newFlashLoanLogicPair(loans: FlashLoanFields['loans']): [FlashLoanLogic, FlashLoanLogic];
}

export interface FlashLoanerClass {
  new (chainId: number, library: providers.Provider): FlashLoaner;
  readonly supportedChainIds: number[];
  isSupported: (chainId: number) => boolean;
}
