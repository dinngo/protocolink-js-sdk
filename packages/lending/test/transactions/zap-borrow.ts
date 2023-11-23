import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import hre from 'hardhat';
import { mainnetTokens } from '@protocolink/test-helpers';

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
        protocolId: 'aavev3',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.USDC,
          srcAmount: '1',
          destToken: mainnetTokens.WBTC,
        },
      },
      {
        skip: false,
        testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: mainnetTokens.USDC,
          srcAmount: '1000',
          destToken: mainnetTokens.WBTC,
        },
      },
      {
        skip: false,
        testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: mainnetTokens.USDC,
          srcAmount: '1000',
          destToken: mainnetTokens.USDC,
        },
      },
    ];

    for (const [i, { skip, testingAccount, protocolId, marketId, params }] of testCases.entries()) {
      if (skip) continue;
      it.only(`case ${i + 1}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);

        const zapBorrowInfo = await adapter.getZapBorrow(protocolId, marketId, params, user.address, portfolio);

        const estimateResult = await zapBorrowInfo.estimateResult;

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.approvals).to.have.lengthOf(1);

        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        const transactionRequest = await zapBorrowInfo.buildRouterTransactionRequest();

        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');

        const tx = await user.sendTransaction(transactionRequest);

        expect(tx).to.not.be.reverted;
      });
    }
  });
});
