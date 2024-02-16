import { Protocol } from 'src/protocol';
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
  protocol: Protocol,
  marketId: string,
  user: SignerWithAddress,
  collateralToken: common.Token
) {
  switch (protocol.id) {
    case 'aave-v2':
    case 'radiant-v2':
    case 'aave-v3':
    case 'spark':
      return getBalance(user.address, protocol.toProtocolToken(marketId, collateralToken)!.address);
    case 'compound-v3':
      return compoundV3.getCollateralBalance(chainId, marketId, user.address, collateralToken);
    case 'morphoblue':
      return morphoblue.getCollateralBalance(chainId, marketId, user);
    default:
      return undefined;
  }
}

export async function getBorrowBalance(
  chainId: number,
  protocolId: string,
  marketId: string,
  user: SignerWithAddress,
  borrowToken: common.Token
) {
  switch (protocolId) {
    case 'aave-v2':
      return getBalance(user.address, aaveV2.toVariableDebtToken(borrowToken)!);
    case 'radiant-v2':
      return getBalance(user.address, radiantV2.toVariableDebtToken(borrowToken)!);
    case 'aave-v3':
      return getBalance(user.address, aaveV3.toVariableDebtToken(borrowToken)!);
    case 'spark':
      return getBalance(user.address, spark.toVariableDebtToken(borrowToken)!);
    case 'compound-v3':
      return compoundV3.getBorrowBalance(chainId, marketId, user.address);
    case 'morphoblue':
      return morphoblue.getBorrowBalance(chainId, marketId, user);
    default:
      return undefined;
  }
}

export function toVariableDebtToken(chainId: number, protocolId: string, underlyingToken: common.Token) {
  if (chainId !== common.ChainId.mainnet) return undefined;

  switch (protocolId) {
    case 'aave-v2':
      return aaveV2.toVariableDebtToken(underlyingToken);
    case 'radiant-v2':
      return radiantV2.toVariableDebtToken(underlyingToken);
    case 'aave-v3':
      return aaveV3.toVariableDebtToken(underlyingToken);
    case 'spark':
      return spark.toVariableDebtToken(underlyingToken);
    default:
      return undefined;
  }
}
