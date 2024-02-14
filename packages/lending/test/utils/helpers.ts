import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from './aave-v2';
import * as aaveV3 from './aave-v3';
import * as common from '@protocolink/common';
import * as compoundV3 from './compound-v3';
import { getBalance } from '@protocolink/test-helpers';
import * as morphoblue from './morphoblue';
import * as radiantV2 from './radiant-v2';
import * as spark from './spark';

export async function deposit(
  chainId: number,
  protocolId: string,
  marketId: string,
  user: SignerWithAddress,
  tokenAmount: common.TokenAmount
) {
  switch (protocolId) {
    case 'aave-v2':
      return aaveV2.deposit(chainId, user, tokenAmount);
    case 'radiant-v2':
      return radiantV2.deposit(chainId, user, tokenAmount);
    case 'aave-v3':
      return aaveV3.supply(chainId, user, tokenAmount);
    case 'spark':
      return spark.supply(chainId, user, tokenAmount);
    case 'compound-v3':
      return compoundV3.supply(chainId, marketId, user, tokenAmount);
    case 'morphoblue':
      return morphoblue.deposit(chainId, marketId, user, tokenAmount);
    default:
      return undefined;
  }
}
export async function borrow(
  chainId: number,
  protocolId: string,
  marketId: string,
  user: SignerWithAddress,
  tokenAmount: common.TokenAmount
) {
  switch (protocolId) {
    case 'aave-v2':
      return aaveV2.borrow(chainId, user, tokenAmount);
    case 'radiant-v2':
      return radiantV2.borrow(chainId, user, tokenAmount);
    case 'aave-v3':
      return aaveV3.borrow(chainId, user, tokenAmount);
    case 'spark':
      return spark.borrow(chainId, user, tokenAmount);
    case 'compound-v3':
      return compoundV3.borrow(chainId, marketId, user, tokenAmount);
    case 'morphoblue':
      return morphoblue.borrow(chainId, marketId, user, tokenAmount);
    default:
      return undefined;
  }
}

export async function getCollateralBalance(
  chainId: number,
  protocolId: string,
  marketId: string,
  user: SignerWithAddress,
  accountingToken: common.Token
) {
  switch (protocolId) {
    case 'aave-v2':
    case 'radiant-v2':
    case 'aave-v3':
    case 'spark':
      return getBalance(user.address, accountingToken);
    case 'compound-v3':
      return compoundV3.getCollateralBalance(chainId, marketId, user.address, accountingToken);
    case 'morphoblue':
      return morphoblue.getCollateralBalance(chainId, marketId, user, accountingToken);
    default:
      return undefined;
  }
}

export async function getBorrowBalance(
  chainId: number,
  protocolId: string,
  marketId: string,
  user: SignerWithAddress,
  accountingToken?: string | common.Token
) {
  switch (protocolId) {
    case 'aave-v2':
    case 'radiant-v2':
    case 'aave-v3':
    case 'spark':
      return getBalance(user.address, accountingToken!);
    case 'compound-v3':
      return compoundV3.getBorrowBalance(chainId, marketId, user.address);
    case 'morphoblue':
      return morphoblue.getBorrowBalance(chainId, marketId, user);
    default:
      return undefined;
  }
}
