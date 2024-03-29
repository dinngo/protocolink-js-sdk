/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers';
import type { Provider } from '@ethersproject/providers';
import type { PriceFeed, PriceFeedInterface } from '../PriceFeed';

const _abi = [
  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [
      {
        internalType: 'int256',
        name: '',
        type: 'int256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class PriceFeed__factory {
  static readonly abi = _abi;
  static createInterface(): PriceFeedInterface {
    return new utils.Interface(_abi) as PriceFeedInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): PriceFeed {
    return new Contract(address, _abi, signerOrProvider) as PriceFeed;
  }
}
