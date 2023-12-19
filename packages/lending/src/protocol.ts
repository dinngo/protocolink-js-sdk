import {
  BorrowFields,
  BorrowParams,
  Market,
  RepayFields,
  RepayParams,
  SupplyFields,
  SupplyParams,
  WithdrawFields,
  WithdrawParams,
} from './protocol.type';
import { Portfolio } from './protocol.portfolio';
import * as api from '@protocolink/api';
import * as common from '@protocolink/common';
import { providers } from 'ethers';

export abstract class Protocol extends common.Web3Toolkit {
  static readonly markets: Market[];

  static isSupported(chainId: number) {
    return this.markets.some((market) => market.chainId === chainId);
  }

  blockTag?: providers.BlockTag;

  setBlockTag(blockTag: providers.BlockTag) {
    this.blockTag = blockTag;
  }

  abstract id: string;

  abstract getMarketName(id: string): string;

  abstract getPortfolio(account: string, marketId: string): Promise<Portfolio>;

  abstract getPortfolios(account: string): Promise<Portfolio[]>;

  canCollateralSwap(_marketId: string, _assetToken: common.Token) {
    return true;
  }

  canDebtSwap(_marketId: string, _assetToken: common.Token) {
    return true;
  }

  canLeverage(_marketId: string, _assetToken: common.Token) {
    return true;
  }

  canLeverageShort = true;

  canDeleverage(_marketId: string, _assetToken: common.Token) {
    return true;
  }

  abstract toUnderlyingToken(marketId: string, protocolToken: common.Token): common.Token;

  abstract toProtocolToken(marketId: string, underlyingToken: common.Token): common.Token;

  abstract isProtocolToken(marketId: string, token: common.Token): boolean;

  isAssetTokenized(_marketId: string, _assetToken: common.Token) {
    return true;
  }

  preferredFlashLoanerId?: string;

  abstract newSupplyLogic(params: SupplyParams): api.Logic<SupplyFields>;

  abstract newWithdrawLogic(params: WithdrawParams): api.Logic<WithdrawFields>;

  abstract newBorrowLogic(params: BorrowParams): api.Logic<BorrowFields>;

  abstract newRepayLogic(params: RepayParams): api.Logic<RepayFields>;
}

export interface ProtocolClass {
  new (chainId: number, library: providers.Provider): Protocol;
  readonly markets: Market[];
  isSupported: (chainId: number) => boolean;
}
