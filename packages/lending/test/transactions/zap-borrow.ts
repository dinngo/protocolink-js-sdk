import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

describe('Transaction: Zap Borrow', function () {
  const chainId = 1;
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
  });

  context('Test ZapBorrow', function () {
    const testCases = [
      {
        skip: false,
        testingAccount: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.USDC,
          srcAmount: '1',
          destToken: aaveV3.mainnetTokens.WBTC,
        },
      },
      {
        skip: false,
        testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        protocolId: 'compound-v2',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.USDC,
          srcAmount: '1000',
          destToken: compoundV3.mainnetTokens.WBTC,
        },
      },
      {
        skip: false,
        testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        protocolId: 'compound-v2',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.USDC,
          srcAmount: '1000',
          destToken: compoundV3.mainnetTokens.USDC,
        },
      },
      {
        skip: false,
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        testingAccount: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        params: {
          srcToken: aaveV2.mainnetTokens.USDC,
          srcAmount: '1000',
          destToken: aaveV2.mainnetTokens.USDC,
        },
      },
      {
        skip: false,
        protocolId: 'radiantv2',
        marketId: 'mainnet',
        testingAccount: '0xA38D6E3Aa9f3E4F81D4cEf9B8bCdC58aB37d066A',
        params: {
          srcToken: radiantV2.mainnetTokens.USDC,
          srcAmount: '1000',
          destToken: radiantV2.mainnetTokens.USDC,
        },
      },
    ];

    for (const [i, { skip, testingAccount, protocolId, marketId, params }] of testCases.entries()) {
      if (skip) continue;
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);

        const { estimateResult, buildRouterTransactionRequest } = await adapter.getZapBorrow(
          protocolId,
          marketId,
          params,
          user.address,
          portfolio
        );

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.approvals).to.have.lengthOf(1);

        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        const transactionRequest = await buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');

        const tx = await user.sendTransaction(transactionRequest);
        expect(tx).to.not.be.reverted;
      });
    }
  });
});
