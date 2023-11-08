import { FLASHLOAN_TOTAL_PREMIUM, NAME, tokensForFlashLoanMap } from './configs';
import { FlashLoanFields, FlashLoanLogic, getProtocolTokenList, protocols, quote } from '@protocolink/api';
import { FlashLoaner } from 'src/flashloaner';
import * as api from '@protocolink/api';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export class LendingFlashLoaner extends FlashLoaner {
  quote(params: api.protocols.aavev3.FlashLoanParams): Promise<logics.aavev3.FlashLoanLogicQuotation> {
    return quote(this.chainId, logics.aavev3.FlashLoanLogic.rid, params);
  }

  newFlashLoanLogicPair(loans: FlashLoanFields['loans']): [FlashLoanLogic, FlashLoanLogic] {
    return protocols.aavev3.newFlashLoanLogicPair(loans);
  }

  static readonly supportedChainIds = Object.keys(tokensForFlashLoanMap).map((chainId) => Number(chainId));

  readonly id = NAME;
  readonly feeBps = FLASHLOAN_TOTAL_PREMIUM;

  get tokens() {
    return tokensForFlashLoanMap[this.chainId];
  }
}
