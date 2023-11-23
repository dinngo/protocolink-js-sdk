import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import hre from 'hardhat';
import { mainnetTokens } from '@protocolink/test-helpers';

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
          srcToken: mainnetTokens.ETH,
          srcAmount: '0.0045',
          destToken: mainnetTokens.USDC,
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
          srcToken: mainnetTokens.ETH,
          srcAmount: '500',
          destToken: mainnetTokens.USDC,
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
      it.only(`case ${i + 1}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);

        const sdkInfo = await adapter.getLeverageLong(protocolId, marketId, params, user.address, portfolio);

        const estimateResult = await sdkInfo.estimateResult;

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        // expect(estimateResult.approvals).to.have.lengthOf(expects.apporveTimes);

        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        const transactionRequest = await sdkInfo.buildRouterTransactionRequest();

        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');

        const tx = await user.sendTransaction(transactionRequest);

        expect(tx).to.not.be.reverted;
      });
    }
  });
});
