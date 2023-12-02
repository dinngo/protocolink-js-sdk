import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

describe('Transaction: Deleverage', function () {
  const chainId = 1;
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
  });

  context('Test Deleverage', function () {
    const testCases = [
      {
        skip: true,
        testingAccount: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.USDC,
          srcAmount: '1.4',
          destToken: aaveV3.mainnetTokens.ETH,
        },
        expects: {
          funds: [],
          balances: [],
          apporveTimes: 2,
          receives: [],
        },
      },
      {
        skip: true,
        testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        protocolId: 'compound-v2',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.USDC,
          srcAmount: '5000',
          destToken: compoundV3.mainnetTokens.WBTC,
        },
        expects: {
          funds: [],
          balances: [],
          apporveTimes: 0,
          receives: [],
        },
      },
      {
        skip: true,
        testingAccount: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV2.mainnetTokens.DAI,
          srcAmount: '0.1',
          destToken: aaveV2.mainnetTokens.ETH,
        },
        expects: {
          funds: [],
          balances: [],
          apporveTimes: 2,
          receives: [],
        },
      },
      {
        skip: false,
        testingAccount: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        protocolId: 'radiantv2',
        marketId: 'mainnet',
        params: {
          srcToken: radiantV2.mainnetTokens.USDC,
          srcAmount: '0.002',
          destToken: radiantV2.mainnetTokens.ETH,
        },
        expects: {
          funds: [],
          balances: [],
          apporveTimes: 2,
          receives: [],
        },
      },
    ];

    for (const [i, { skip, testingAccount, protocolId, marketId, params }] of testCases.entries()) {
      if (skip) continue;
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);

        const { estimateResult, buildRouterTransactionRequest } = await adapter.getDeleverage(
          protocolId,
          marketId,
          params,
          user.address,
          portfolio
        );

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

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
