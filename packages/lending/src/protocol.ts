import {
  BorrowFields,
  BorrowParams,
  Market,
  ProtocolInfo,
  RepayFields,
  RepayParams,
  SupplyFields,
  SupplyParams,
  WithdrawFields,
  WithdrawParams,
} from './protocol.type';
import { Portfolio } from './protocol.portfolio';
import * as api from '@protocolink/api';
import axios from 'axios';
import * as common from '@protocolink/common';
import { lstTokenAPYsURL } from './protocol.utils';
import { providers } from 'ethers';

export abstract class Protocol extends common.Web3Toolkit {
  static readonly markets: Market[];
  static lstAPYs: Record<string, Record<string, string>>;

  static isSupported(chainId: number) {
    return this.markets.some((market) => market.chainId === chainId);
  }

  blockTag?: providers.BlockTag;

  setBlockTag(blockTag: providers.BlockTag | undefined) {
    this.blockTag = blockTag;
  }

  abstract id: string;

  abstract name: string;

  abstract getMarketName(id: string): string;

  abstract getPortfolio(account: string, marketId: string): Promise<Portfolio>;

  abstract getPortfolios(account: string): Promise<Portfolio[]>;

  abstract getProtocolInfos(): Promise<ProtocolInfo[]>;

  async getLstTokenAPYMap(chainId: number): Promise<Record<string, string>> {
    if (Protocol.lstAPYs) return Protocol.lstAPYs[chainId.toString()] || {};

    try {
      const { data } = await axios.get(lstTokenAPYsURL);

      Protocol.lstAPYs = data;
    } catch {
      Protocol.lstAPYs = {};
    }

    return Protocol.lstAPYs?.[chainId.toString()] || {};
  }

  canCollateralSwap(_marketId: string, _assetToken: common.Token) {
    return true;
  }

  canDebtSwap(_marketId: string, _assetToken: common.Token) {
    return true;
  }

  canLeverageByCollateral(_marketId: string, _assetToken: common.Token) {
    return true;
  }

  canLeverageByDebt = true;

  canDeleverage(_marketId: string, _assetToken: common.Token) {
    return true;
  }

  canOpenByCollateral(_marketId: string, _assetToken: common.Token) {
    return this.canLeverageByCollateral(_marketId, _assetToken);
  }

  canOpenByDebt = this.canLeverageByDebt;

  canClose(_marketId: string, _assetToken: common.Token) {
    return this.canDeleverage(_marketId, _assetToken);
  }

  toUnderlyingToken(_marketId: string, _protocolToken: common.Token): common.Token | undefined {
    return undefined;
  }

  toProtocolToken(_marketId: string, _underlyingToken: common.Token): common.Token | undefined {
    return undefined;
  }

  isProtocolToken(_marketId: string, _token: common.Token) {
    return false;
  }

  isAssetTokenized(_marketId: string, _assetToken: common.Token) {
    return true;
  }

  preferredFlashLoanProtocolId?: string;

  abstract newSupplyLogic(params: SupplyParams): api.Logic<SupplyFields>;

  abstract newWithdrawLogic(params: WithdrawParams): api.Logic<WithdrawFields>;

  abstract newBorrowLogic(params: BorrowParams): api.Logic<BorrowFields>;

  abstract newRepayLogic(params: RepayParams): api.Logic<RepayFields>;
}

export interface ProtocolClass {
  new (chainId: number, library?: providers.Provider): Protocol;
  createProtocol(chainId: number, provider?: providers.Provider): Promise<Protocol>;
  readonly markets: Market[];
  isSupported: (chainId: number) => boolean;
}
