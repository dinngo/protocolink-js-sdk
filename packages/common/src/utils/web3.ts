import invariant from 'tiny-invariant';
import { utils } from 'ethers';

export function shortenAddress(address: string, digits = 4): string {
  invariant(utils.isAddress(address), 'invalid address');
  return `${address.substring(0, digits + 2)}...${address.substring(42 - digits)}`;
}

export function shortenTransactionHash(hash: string, digits = 4): string {
  return `${hash.substring(0, digits + 2)}...${hash.substring(66 - digits)}`;
}
