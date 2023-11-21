import { LendingProtocol } from './lending-protocol';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import { mainnetTokens } from '@protocolink/test-helpers';

const account = '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB';
const chainId = 1;

describe('Compound V3 LendingProtocol', () => {
  context('new Compound Lending Protocol', async () => {
    it.skip('getPortfolios', async () => {
      const compoundv3 = new LendingProtocol(chainId, hre.ethers.provider);
      const portfolios = await compoundv3.getPortfolios(account);
      console.log(portfolios);
    });

    it.only('isProtocolToken', () => {
      const cUSDC = {
        chainId: 1,
        address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
        decimals: 6,
        symbol: 'cUSDCv3',
        name: 'Compound USDC',
      };

      const testCases = [
        {
          data: {
            token: new common.Token(cUSDC),
          },
          expects: {
            result: true,
          },
        },
        {
          data: {
            token: mainnetTokens.USDC,
          },
          expects: {
            result: false,
          },
        },
      ];

      const compoundv3 = new LendingProtocol(chainId, hre.ethers.provider);
      testCases.forEach(({ data, expects }) => {
        const result = compoundv3.isProtocolToken(data.token);
        expect(result).to.eq(expects.result);
      });
    });
  });
});
