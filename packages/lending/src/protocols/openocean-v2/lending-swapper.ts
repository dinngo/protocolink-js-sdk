import { ID, supportedChainIds } from './configs';
import { Swapper } from 'src/swapper';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export class LendingSwapper extends Swapper {
  static readonly supportedChainIds = supportedChainIds;

  readonly id = ID;
  readonly canCustomToken = false;

  private _tokens?: common.Token[];

  static isSupported(chainId: number) {
    return this.supportedChainIds.includes(chainId);
  }

  async tokens() {
    if (!this._tokens) {
      this._tokens = await apisdk.protocols.openoceanv2.getSwapTokenTokenList(this.chainId);
    }
    return this._tokens!;
  }

  async quote(params: apisdk.protocols.openoceanv2.SwapTokenParams): Promise<logics.openoceanv2.SwapTokenLogicFields> {
    return await apisdk.quote(this.chainId, logics.openoceanv2.SwapTokenLogic.rid, params);
  }

  newSwapTokenLogic(fields: apisdk.protocols.openoceanv2.SwapTokenFields): apisdk.protocols.openoceanv2.SwapTokenLogic {
    return apisdk.protocols.openoceanv2.newSwapTokenLogic(fields);
  }
}
