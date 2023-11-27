import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

describe('Transaction: Leverage Long', function () {
  const chainId = 1;
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
  });

  context('Test Leverage Long', function () {
    const testCases = [
      {
        skip: false,
        testingAccount: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        protocolId: 'aavev3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.ETH,
          srcAmount: '0.0045',
          destToken: aaveV3.mainnetTokens.USDC,
        },
        expects: {
          funds: [],
          balances: [],
          apporveTimes: 2,
          recieves: [],
        },
      },
      {
        skip: false,
        testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.ETH,
          srcAmount: '500',
          destToken: compoundV3.mainnetTokens.USDC,
        },
        expects: {
          funds: [],
          balances: [],
          apporveTimes: 0,
          recieves: [],
        },
      },
    ];

    for (const [i, { skip, testingAccount, protocolId, marketId, params }] of testCases.entries()) {
      if (skip) continue;

      it.only(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);

        const { estimateResult, buildRouterTransactionRequest } = await adapter.getLeverageLong(
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
