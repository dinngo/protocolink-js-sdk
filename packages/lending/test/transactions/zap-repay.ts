import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import hre from 'hardhat';
import { mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';

describe('Transaction: Zap Repay', function () {
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  const chainId = 1;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
  });

  snapshotAndRevertEach();

  context('Test ZapRepay', function () {
    const testCases = [
      {
        skip: false,
        protocolId: 'aavev3',
        marketId: 'mainnet',
        testingAccount: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        params: {
          srcToken: mainnetTokens.WBTC,
          srcAmount: '0.0001',
          destToken: mainnetTokens.USDC,
        },
      },
      {
        skip: false,
        protocolId: 'compoundv3',
        marketId: 'USDC',
        testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        params: {
          srcToken: mainnetTokens.ETH,
          srcAmount: '1',
          destToken: mainnetTokens.USDC,
        },
      },
    ];

    for (const [i, { skip, protocolId, marketId, testingAccount, params }] of testCases.entries()) {
      if (skip) continue;
      it.only(`case ${i + 1}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

        const zapRepayInfo = await adapter.getZapRepay(protocolId, marketId, params, user.address, portfolio);

        const estimateResult = await zapRepayInfo.estimateResult;

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        const transactionRequest = await zapRepayInfo.buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');

        const tx = await user.sendTransaction(transactionRequest);

        expect(tx).to.not.be.reverted;
      });
    }
  });
});
