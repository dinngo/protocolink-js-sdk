import { NAME } from './configs';
import { Swaper } from 'src/swaper';
import * as api from '@protocolink/api';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';
import { quote } from '@protocolink/api';

export class LendingSwaper extends Swaper {
  static readonly supportedChainIds = [1088];

  readonly id = NAME;
  readonly canCustomToken = false;

  private _tokens?: common.Token[];

  static isSupported(chainId: number) {
    return this.supportedChainIds.includes(chainId);
  }

  async tokens() {
    if (!this._tokens) {
      this._tokens = await api.protocols.openoceanv2.getSwapTokenTokenList(this.chainId);
    }
    return this._tokens!;
  }

  async quote(params: api.protocols.paraswapv5.SwapTokenParams): Promise<logics.openoceanv2.SwapTokenLogicFields> {
    return await quote(this.chainId, logics.openoceanv2.SwapTokenLogic.rid, params);
  }

  newSwapTokenLogic(fields: api.protocols.openoceanv2.SwapTokenFields): api.protocols.openoceanv2.SwapTokenLogic {
    return api.protocols.openoceanv2.newSwapTokenLogic(fields);
  }

  isExactIn() {
    return true;
  }
}

// export async function getSwapTokenTokenList(chainId: number): Promise<logics.openoceanv2.SwapTokenLogicTokenList> {
//   return getProtocolTokenList(chainId, logics.openoceanv2.SwapTokenLogic.rid);
// }

// export async function getSwapTokenQuotation(
//   chainId: number,
//   params: SwapTokenParams
// ): Promise<logics.openoceanv2.SwapTokenLogicFields> {
//   return quote(chainId, logics.openoceanv2.SwapTokenLogic.rid, params);
// }

// export function newSwapTokenLogic(fields: SwapTokenFields): SwapTokenLogic {
//   return { rid: logics.openoceanv2.SwapTokenLogic.rid, fields };
// }
