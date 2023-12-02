import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import { claimToken, getBalance } from '@protocolink/test-helpers';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

describe('Transaction: Collateral swap', function () {
  const chainId = 1;
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });

    await claimToken(chainId, '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E', aaveV2.mainnetTokens.USDC, '10000');
    await claimToken(chainId, '0xA38D6E3Aa9f3E4F81D4cEf9B8bCdC58aB37d066A', radiantV2.mainnetTokens.USDC, '10000');
  });

  context('Test Collateral swap', function () {
    const testCases = [
      {
        skip: false,
        testingAccount: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.WBTC,
          srcAmount: '48',
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
        protocolId: 'compound-v3',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.WBTC,
          srcAmount: '160',
          destToken: compoundV3.mainnetTokens.ETH,
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
        testingAccount: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV2.mainnetTokens.WBTC,
          srcAmount: '0.01',
          destToken: aaveV2.mainnetTokens.USDC,
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
        testingAccount: '0xA38D6E3Aa9f3E4F81D4cEf9B8bCdC58aB37d066A',
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        params: {
          srcToken: radiantV2.mainnetTokens.WBTC,
          srcAmount: '0.01',
          destToken: radiantV2.mainnetTokens.USDC,
        },
        expects: {
          funds: [],
          balances: [],
          apporveTimes: 0,
          receives: [],
        },
      },
    ];

    for (const [i, { skip, testingAccount, protocolId, marketId, params }] of testCases.entries()) {
      if (skip) continue;

      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);

        // before balance
        const beforeBalance = await getBalance(user.address, aaveV3.mainnetTokens.aEthWBTC);
        console.log('before balance', JSON.stringify(beforeBalance.amount.toString(), null, 2));

        const { estimateResult, buildRouterTransactionRequest } = await adapter.getCollateralSwap(
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

        // after balance
        const afterBalance = await getBalance(user.address, aaveV3.mainnetTokens.aEthWBTC);
        console.log('after balance', JSON.stringify(afterBalance.amount.toString(), null, 2));
      });
    }
  });
});
