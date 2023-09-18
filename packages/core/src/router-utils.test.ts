import { decodeReferral, encodeReferral } from './router-utils';
import { expect } from 'chai';

describe('Test encodeReferral', function () {
  const testCases = [
    {
      collector: '0xDdbe07CB6D77e81802C55bB381546c0DA51163dd',
      rate: 10000,
      expected: '0xddbe07cb6d77e81802c55bb381546c0da51163dd000000000000000000002710',
    },
    {
      collector: '0xDdbe07CB6D77e81802C55bB381546c0DA51163dd',
      rate: 5000,
      expected: '0xddbe07cb6d77e81802c55bb381546c0da51163dd000000000000000000001388',
    },
  ];

  testCases.forEach(({ collector, rate, expected }, i) => {
    it(`case ${i + 1}`, function () {
      const referral = encodeReferral(collector, rate);
      expect(referral).to.eq(expected);
    });
  });
});

describe('Test encodeReferral', function () {
  const testCases = [
    {
      referral: '0xddbe07cb6d77e81802c55bb381546c0da51163dd000000000000000000002710',
      expected: {
        collector: '0xDdbe07CB6D77e81802C55bB381546c0DA51163dd',
        rate: 10000,
      },
    },
    {
      referral: '0xddbe07cb6d77e81802c55bb381546c0da51163dd000000000000000000001388',
      expected: {
        collector: '0xDdbe07CB6D77e81802C55bB381546c0DA51163dd',
        rate: 5000,
      },
    },
  ];

  testCases.forEach(({ referral, expected }, i) => {
    it(`case ${i + 1}`, function () {
      const { collector, rate } = decodeReferral(referral);
      expect(collector).to.eq(expected.collector);
      expect(rate).to.eq(expected.rate);
    });
  });
});
