import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

describe('Transaction: Debt swap', function () {
  const chainId = 1;
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
  });

  context('Test Debt swap', function () {
    const testCases = [
      {
        skip: false,
        testingAccount: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.USDC,
          srcAmount: '20000',
          destToken: aaveV3.mainnetTokens.DAI,
        },
        expects: {
          funds: [],
          balances: [],
          apporveTimes: 1, // approveDelegation
          receives: [],
        },
      },
      {
        skip: false,
        testingAccount: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV2.mainnetTokens.USDC,
          srcAmount: '1000',
          destToken: aaveV2.mainnetTokens.DAI,
        },
        expects: {
          funds: [],
          balances: [],
          apporveTimes: 1, // approveDelegation
          receives: [],
        },
      },
      {
        skip: false,
        testingAccount: '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e',
        protocolId: 'radiantv2',
        marketId: 'mainnet',
        params: {
          srcToken: radiantV2.mainnetTokens.USDC,
          srcAmount: '0.1',
          destToken: radiantV2.mainnetTokens.USDT,
        },
        expects: {
          funds: [],
          balances: [],
          apporveTimes: 1, // approveDelegation
          receives: [],
        },
      },
    ];

    for (const [i, { skip, testingAccount, protocolId, marketId, params, expects }] of testCases.entries()) {
      if (skip) continue;
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);

        const { estimateResult, buildRouterTransactionRequest } = await adapter.getDebtSwap(
          protocolId,
          marketId,
          params,
          user.address,
          portfolio
        );

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.approvals).to.have.lengthOf(expects.apporveTimes);

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
