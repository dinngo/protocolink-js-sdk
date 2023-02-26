import { BigNumber, utils } from 'ethers';
import { expect } from 'chai';
import { getParamOffset } from './abi';

describe('Test getParamOffset', function () {
  const testCases = [
    {
      types: ['uint256'],
      values: [BigNumber.from(10).pow(18)],
      paramIndex: 0,
      expected: {
        data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        offset: 0,
        param: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      },
    },
    {
      types: ['uint256', 'uint256'],
      values: ['1000000', BigNumber.from(10).pow(18)],
      paramIndex: 1,
      expected: {
        data: '0x00000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000de0b6b3a7640000',
        offset: 32,
        param: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      },
    },
    {
      types: ['bool', 'uint256'],
      values: [true, BigNumber.from(10).pow(18)],
      paramIndex: 1,
      expected: {
        data: '0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a7640000',
        offset: 32,
        param: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      },
    },
    {
      types: ['address', 'uint256'],
      values: ['0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', BigNumber.from(10).pow(18)],
      paramIndex: 1,
      expected: {
        data: '0x000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        offset: 32,
        param: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      },
    },
    {
      types: ['address[]', 'uint256'],
      values: [
        ['0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'],
        BigNumber.from(10).pow(18),
      ],
      paramIndex: 1,
      expected: {
        data: '0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        offset: 32,
        param: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      },
    },
    {
      types: ['uint256[]', 'uint256'],
      values: [['1000000', '1000000'], BigNumber.from(10).pow(18)],
      paramIndex: 1,
      expected: {
        data: '0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000f4240',
        offset: 32,
        param: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      },
    },
    {
      types: ['bytes', 'uint256'],
      values: [
        '0x095ea7b3000000000000000000000000a36972e347e538e6c7afb9f44fb10dda7bba9ba2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        BigNumber.from(10).pow(18),
      ],
      paramIndex: 1,
      expected: {
        data: '0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000a36972e347e538e6c7afb9f44fb10dda7bba9ba2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000',
        offset: 32,
        param: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      },
    },
    {
      types: ['(address,uint256,address,bytes)', 'address[]', 'uint256'],
      values: [
        [
          '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          '1000000',
          '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          '0x095ea7b3000000000000000000000000a36972e347e538e6c7afb9f44fb10dda7bba9ba2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        ],
        ['0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'],
        BigNumber.from(10).pow(18),
      ],
      paramIndex: 2,
      expected: {
        data: '0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000a36972e347e538e6c7afb9f44fb10dda7bba9ba2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        offset: 64,
        param: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      },
    },
  ];

  testCases.forEach(({ types, values, paramIndex, expected }) => {
    it(JSON.stringify(types), function () {
      const data = utils.defaultAbiCoder.encode(types, values);
      expect(data).to.eq(expected.data);
      const offset = getParamOffset(paramIndex);
      expect(offset).to.eq(expected.offset);
      const param = utils.hexlify(utils.arrayify(data).slice(offset, offset + 32));
      expect(param).to.eq(expected.param);
    });
  });
});
