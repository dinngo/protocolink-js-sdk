import {
  Market,
  RepayLogic,
  RepayParams,
  SupplyLogic,
  SupplyParams,
  WithdrawLogic,
  WithdrawParams,
} from './protocol.type';
import { Portfolio } from './protocol.portfolio';
import * as common from '@protocolink/common';
import { providers } from 'ethers';

export abstract class Protocol extends common.Web3Toolkit {
  static readonly markets: Market[];

  static isSupported(chainId: number) {
    return this.markets.some((market) => market.chainId === chainId);
  }

  abstract id: string;

  abstract getMarketName(id: string): string;

  abstract getPortfolio(account: string, marketId: string): Promise<Portfolio>;

  abstract getPortfolios(account: string): Promise<Portfolio[]>;

  canCollateralSwap(_assetToken: common.Token) {
    return true;
  }

  canDebtSwap(_assetToken: common.Token) {
    return true;
  }

  canLeverage(_assetToken: common.Token) {
    return true;
  }

  canLeverageShort = true;

  canDeleverage(_assetToken: common.Token) {
    return true;
  }

  toUnderlyingToken?(protocolToken: common.Token): common.Token;

  toProtocolToken?(underlyingToken: common.Token): common.Token;

  abstract isProtocolToken(token: common.Token): boolean;

  isAaveLike = false;

  isUsingWrappedNativeToken = true;

  preferredFlashLoanerId?: string;

  abstract newSupplyLogic(params: SupplyParams): Promise<SupplyLogic>;

  abstract newWithdrawLogic(params: WithdrawParams): Promise<WithdrawLogic>;

  // abstract newBorrowLogic(fields: BorrowFields): BorrowLogic;
  abstract newBorrowLogic(fields: any): any;

  abstract newRepayLogic(params: RepayParams): Promise<RepayLogic>;
}

export interface ProtocolClass {
  new (chainId: number, library: providers.Provider): Protocol;
  readonly markets: Market[];
  isSupported: (chainId: number) => boolean;
}
