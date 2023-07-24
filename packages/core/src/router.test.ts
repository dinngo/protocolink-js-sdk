import { calcAccountAgent } from './router';
import * as common from '@protocolink/common';
import { expect } from 'chai';

describe('Test calcAccountAgent', function () {
  const testCases = [
    {
      chainId: common.ChainId.polygon,
      account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
      expected: '0x23FDa9012F21FB03c1E0e271c20D4aA62d3A6923',
    },
    {
      chainId: common.ChainId.polygon,
      account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
      expected: '0xa3Dcd65c3c2260d5c492174CDe2522AC12514223',
    },
    {
      chainId: common.ChainId.arbitrum,
      account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
      expected: '0x23FDa9012F21FB03c1E0e271c20D4aA62d3A6923',
    },
    {
      chainId: common.ChainId.arbitrum,
      account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
      expected: '0xa3Dcd65c3c2260d5c492174CDe2522AC12514223',
    },
    {
      chainId: common.ChainId.zksync,
      account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
      expected: '0xC055Cc1AFe2563C72A9b5fBbFc191730d19a7275',
    },
    {
      chainId: common.ChainId.zksync,
      account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
      expected: '0x7Ae1cdB4cA3C4D3C753d3d7Dc1A8FAe3596332A0',
    },
  ];

  testCases.forEach(({ chainId, account, expected }, i) => {
    it(`case ${i + 1}`, function () {
      const accountAgent = calcAccountAgent(chainId, account);
      expect(accountAgent).to.eq(expected);
    });
  });
});
