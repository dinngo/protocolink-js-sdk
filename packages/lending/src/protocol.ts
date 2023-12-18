import { Market } from './protocol.type';
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

  isCollateralTokenized = true;

  preferredFlashLoanerId?: string;

  abstract newSupplyLogic(params: any): api.Logic;

  abstract newWithdrawLogic(params: any): api.Logic;

  abstract newBorrowLogic(params: any): api.Logic;

  abstract newRepayLogic(params: any): api.Logic;
}

export interface ProtocolClass {
  new (chainId: number, library: providers.Provider): Protocol;
  readonly markets: Market[];
  isSupported: (chainId: number) => boolean;
}
