import { NAME } from './configs';
import { SwapTokenParams } from '@protocolink/api/dist/protocols/paraswap-v5';
import { Swaper } from 'src/swaper';
import * as api from '@protocolink/api';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';
import { quote } from '@protocolink/api';

export class LendingSwaper extends Swaper {
  static readonly supportedChainIds = [1];

  readonly id = NAME;
  readonly canCustomToken = false;

  private _tokens?: common.Token[];

  static isSupported(chainId: number) {
    return this.supportedChainIds.includes(chainId);
  }

  async tokens() {
    if (!this._tokens) {
      this._tokens = await api.protocols.paraswapv5.getSwapTokenTokenList(this.chainId);
    }
    return this._tokens;
  }

  async quote(params: SwapTokenParams): Promise<logics.paraswapv5.SwapTokenLogicFields> {
    return await quote(this.chainId, logics.paraswapv5.SwapTokenLogic.rid, params);
  }

  newSwapTokenLogic(fields: api.protocols.paraswapv5.SwapTokenFields): api.protocols.paraswapv5.SwapTokenLogic {
    return api.protocols.paraswapv5.newSwapTokenLogic(fields);
  }

  isExactIn() {
    return true;
  }
}
