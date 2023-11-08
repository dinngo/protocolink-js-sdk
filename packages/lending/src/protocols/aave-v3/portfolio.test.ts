import { getPortfolios, getLendingPortfolios } from './portfolio';
import * as common from '@protocolink/common';
import { expect } from 'chai';

const account = '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB';
const chainId = 1;
describe('AaveV3 Portfolio', function () {
  context('Test Portfolios Object', async function () {
    it(`network: ${common.toNetworkId(chainId)}`, async function () {
      const portfolio = await getPortfolios(account);
      expect(portfolio.supplies).to.have.lengthOf.above(0);
      expect(portfolio.borrows).to.have.lengthOf.above(0);
    });
  });

  context('Test getLendingPortfolios', async function () {
    it(`network: ${common.toNetworkId(chainId)}`, async function () {
      const portfolio = await getLendingPortfolios(account);
      console.log('getLendingPortfolios', portfolio);
      expect(portfolio.supplies).to.have.lengthOf.above(0);
      expect(portfolio.borrows).to.have.lengthOf.above(0);
      expect(portfolio).to.include.all.keys(
        'utilization',
        'healthRate',
        'netAPY',
        'liquidationThreshold',
        'totalSupplyUSD',
        'totalBorrowUSD'
      );
    });
  });
});
