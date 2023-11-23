import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, mainnetTokens } from '@protocolink/test-helpers';
import { expect } from 'chai';
import hre from 'hardhat';

describe('Transaction: Collateral swap', function () {
  const chainId = 1;
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
  });

  context('Test Collateral swap', function () {
    const testCases = [
      {
        skip: false,
        testingAccount: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        protocolId: 'aavev3',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.WBTC,
          srcAmount: '48',
          destToken: mainnetTokens.ETH,
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
          srcToken: mainnetTokens.WBTC,
          srcAmount: '160',
          destToken: mainnetTokens.ETH,
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

        const sdkInfo = await adapter.getCollateralSwap(protocolId, marketId, params, user.address, portfolio);
        // console.log('object :>> ', JSON.stringify(sdkInfo.logics, null, 2));

        const estimateResult = await sdkInfo.estimateResult;
        // console.log('estimateResult :>> ', JSON.stringify(estimateResult, null, 2));

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
