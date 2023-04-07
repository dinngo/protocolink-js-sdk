import { expect } from 'chai';
import { shortenAddress } from './web3';

describe('Test shortenAddress', function () {
  const testCases = [
    { address: '0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5', expected: '0xDAFE...8Bc5' },
    { address: '0xd8C1CECCa51d5d97a70a35E194bb6670B85d8576', expected: '0xd8C1...8576' },
    { address: '0x6887246668a3b87F54DeB3b94Ba47a6f63F32985', digits: 6, expected: '0x688724...F32985' },
  ];

  testCases.forEach(({ address, digits, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(shortenAddress(address, digits)).to.eq(expected);
    });
  });
});
