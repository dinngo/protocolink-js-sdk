import {
  BorrowFields,
  BorrowLogic,
  Market,
  RepayFields,
  RepayLogic,
  RepayParams,
  SupplyFields,
  SupplyLogic,
  SupplyParams,
  WithdrawFields,
  WithdrawLogic,
  WithdrawParams,
} from './protocol.types';
import { Portfolio } from './protocol.portfolio';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';
import { providers } from 'ethers';

export abstract class Protocol extends common.Web3Toolkit {
  static readonly markets: Market[];

  static isSupported(chainId: number) {
    return this.markets.some((market) => market.chainId === chainId);
  }

  abstract id: string;

  abstract getMarketName(id: string): string;

  abstract getPortfolio(account: string, marketId?: string): Promise<Portfolio>;

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

  isAaveLike = false;

  isUsingWrappedNativeToken = true;

  preferredFlashLoanerId?: string;

  abstract getSupplyQuotation(params: SupplyParams): Promise<logics.aavev3.SupplyLogicFields>;
  abstract newSupplyLogic(fields: SupplyFields): SupplyLogic;

  abstract getWithdrawQuotation(params: WithdrawParams): Promise<logics.aavev3.WithdrawLogicFields>;
  abstract newWithdrawLogic(fields: WithdrawFields): WithdrawLogic;

  abstract newBorrowLogic(fields: BorrowFields): BorrowLogic;

  abstract getRepayQuotation(params: RepayParams): Promise<logics.aavev3.RepayLogicFields>;
  abstract newRepayLogic(fields: RepayFields): RepayLogic;
}

export interface ProtocolClass {
  new (chainId: number, library: providers.Provider): Protocol;
  readonly markets: Market[];
  isSupported: (chainId: number) => boolean;
}
