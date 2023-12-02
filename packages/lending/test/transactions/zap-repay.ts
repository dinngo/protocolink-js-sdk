import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

describe('Transaction: Zap Repay', function () {
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  const chainId = 1;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
    await claimToken(chainId, '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E', mainnetTokens.USDC, '1000');
  });

  snapshotAndRevertEach();

  context('Test ZapRepay', function () {
    const testCases = [
      {
        skip: false,
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        testingAccount: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        params: {
          srcToken: aaveV3.mainnetTokens.WBTC,
          srcAmount: '0.0001',
          destToken: aaveV3.mainnetTokens.USDC,
        },
      },
      {
        skip: false,
        protocolId: 'compound-v2',
        marketId: 'USDC',
        testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        params: {
          srcToken: compoundV3.mainnetTokens.ETH,
          srcAmount: '1',
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
        testingAccount: '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e',
        params: {
          srcToken: radiantV2.mainnetTokens.ETH,
          srcAmount: '0.1',
          destToken: radiantV2.mainnetTokens.USDC,
        },
      },
    ];

    for (const [i, { skip, protocolId, marketId, testingAccount, params }] of testCases.entries()) {
      if (skip) continue;
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

        const { estimateResult, buildRouterTransactionRequest } = await adapter.getZapRepay(
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
