import { IParam } from './contracts/Router';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { getContractAddress } from './config';

export const FEE_DETAILS = [
  { name: 'token', type: 'address' },
  { name: 'amount', type: 'uint256' },
  { name: 'metadata', type: 'bytes32' },
];

export const INPUT_DETAILS = [
  { name: 'token', type: 'address' },
  { name: 'balanceBps', type: 'uint256' },
  { name: 'amountOrOffset', type: 'uint256' },
];

export const LOGIC_DETAILS = [
  { name: 'to', type: 'address' },
  { name: 'data', type: 'bytes' },
  { name: 'inputs', type: 'Input[]' },
  { name: 'wrapMode', type: 'uint8' },
  { name: 'approveTo', type: 'address' },
  { name: 'callback', type: 'address' },
];

export const LOGIC_BATCH_TYPES = {
  LogicBatch: [
    { name: 'logics', type: 'Logic[]' },
    { name: 'fees', type: 'Fee[]' },
    { name: 'deadline', type: 'uint256' },
  ],
  Logic: LOGIC_DETAILS,
  Input: INPUT_DETAILS,
  Fee: FEE_DETAILS,
};

export type LogicBatchData = {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  values: IParam.LogicBatchStruct;
};

export function getLogicData(chainId: number, values: IParam.LogicBatchStruct): LogicBatchData {
  const domain = {
    name: 'Protocolink',
    version: '1',
    chainId,
    verifyingContract: getContractAddress(chainId, 'Router'),
  };

  return {
    domain,
    types: LOGIC_BATCH_TYPES,
    values,
  };
}
