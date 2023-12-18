import { ID, disabledDexIdsMap, supportedChainIds } from './configs';
import { Swapper } from 'src/swapper';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';

export class LendingSwapper extends Swapper {
  static readonly supportedChainIds = supportedChainIds;

  readonly id = ID;
  readonly canCustomToken = false;

  static isSupported(chainId: number) {
    return this.supportedChainIds.includes(chainId);
  }

  private _tokens?: common.Token[];

  async tokens() {
    if (!this._tokens) {
      this._tokens = await apisdk.protocols.openoceanv2.getSwapTokenTokenList(this.chainId);
    }
    return this._tokens;
  }

  async quote(params: apisdk.protocols.openoceanv2.SwapTokenParams) {
    return apisdk.protocols.openoceanv2.getSwapTokenQuotation(this.chainId, {
      ...params,
      disabledDexIds: disabledDexIdsMap[this.chainId],
    });
  }

  newSwapTokenLogic = apisdk.protocols.openoceanv2.newSwapTokenLogic;
}
