export const BPS_NOT_USED = 0;

export const OFFSET_NOT_USED = '0x8000000000000000000000000000000000000000000000000000000000000000'; // 2^255

export const PERMIT_EXPIRATION = 2592000; // 30d

export const PERMIT_SIG_DEADLINE = 86400; // 1d

export const LOGIC_BATCH_TYPED_DATA_TYPES = {
  LogicBatch: [
    { name: 'logics', type: 'Logic[]' },
    { name: 'fees', type: 'Fee[]' },
    { name: 'referrals', type: 'bytes32[]' },
    { name: 'deadline', type: 'uint256' },
  ],
  Logic: [
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes' },
    { name: 'inputs', type: 'Input[]' },
    { name: 'wrapMode', type: 'uint8' },
    { name: 'approveTo', type: 'address' },
    { name: 'callback', type: 'address' },
  ],
  Fee: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'metadata', type: 'bytes32' },
  ],
  Input: [
    { name: 'token', type: 'address' },
    { name: 'balanceBps', type: 'uint256' },
    { name: 'amountOrOffset', type: 'uint256' },
  ],
};
