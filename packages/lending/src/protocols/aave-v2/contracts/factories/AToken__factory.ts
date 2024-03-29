/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers';
import type { Provider } from '@ethersproject/providers';
import type { AToken, ATokenInterface } from '../AToken';

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'scaledBalanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class AToken__factory {
  static readonly abi = _abi;
  static createInterface(): ATokenInterface {
    return new utils.Interface(_abi) as ATokenInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): AToken {
    return new Contract(address, _abi, signerOrProvider) as AToken;
  }
}
