import { NAME } from './configs';
import { Swaper } from 'src/swaper';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export class LendingSwaper extends Swaper {
  static readonly supportedChainIds = [1, 10, 137, 42161, 43114];

  readonly id = NAME;
  readonly canCustomToken = false;

  private _tokens?: common.Token[];

  static isSupported(chainId: number) {
    return this.supportedChainIds.includes(chainId);
  }

  async tokens() {
    if (!this._tokens) {
      this._tokens = await apisdk.protocols.paraswapv5.getSwapTokenTokenList(this.chainId);
    }
    return this._tokens!;
  }

  async quote(params: apisdk.protocols.paraswapv5.SwapTokenParams): Promise<logics.paraswapv5.SwapTokenLogicFields> {
    return await apisdk.quote(this.chainId, logics.paraswapv5.SwapTokenLogic.rid, params);
  }

  newSwapTokenLogic(fields: apisdk.protocols.paraswapv5.SwapTokenFields): apisdk.protocols.paraswapv5.SwapTokenLogic {
    return apisdk.protocols.paraswapv5.newSwapTokenLogic(fields);
  }

  isExactIn() {
    return true;
  }
}
