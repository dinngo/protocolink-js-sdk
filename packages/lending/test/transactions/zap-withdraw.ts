import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

describe('Transaction: Zap Withdraw', function () {
  const chainId = 1;
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
  });

  context('Test ZapWithdraw', function () {
    const testCases = [
      {
        skip: false,
        testingAccount: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        protocolId: 'aavev3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.WBTC,
          srcAmount: '0.0001',
          destToken: aaveV3.mainnetTokens.USDC,
        },
        expects: {
          funds: [aaveV3.mainnetTokens.aEthWBTC],
          balances: [aaveV3.mainnetTokens.USDC],
          apporveTimes: 2,
          recieves: [aaveV3.mainnetTokens.USDC],
        },
      },
      {
        skip: false,
        testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        protocolId: 'compoundv3',
        marketId: 'ETH',
        params: {
          srcToken: compoundV3.mainnetTokens.ETH,
          srcAmount: '100',
          destToken: compoundV3.mainnetTokens.USDC,
        },
        expects: {
          funds: [compoundV3.mainnetTokens.cWETHv3],
          balances: [compoundV3.mainnetTokens.USDC],
          apporveTimes: 2,
          recieves: [compoundV3.mainnetTokens.USDC],
        },
      },
      {
        skip: false,
        testingAccount: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.ETH,
          srcAmount: '0.0025',
          destToken: compoundV3.mainnetTokens.USDC,
        },
        expects: {
          funds: [],
          balances: [compoundV3.mainnetTokens.USDC],
          apporveTimes: 1,
          recieves: [compoundV3.mainnetTokens.USDC],
        },
      },
      {
        skip: false,
        testingAccount: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.ETH,
          srcAmount: '0.0025',
          destToken: compoundV3.mainnetTokens.ETH,
        },
        expects: {
          funds: [],
          balances: [compoundV3.mainnetTokens.USDC],
          apporveTimes: 1,
          recieves: [compoundV3.mainnetTokens.ETH],
        },
      },
      {
        skip: false,
        testingAccount: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        protocolId: 'aavev2',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV2.mainnetTokens.WBTC,
          srcAmount: '0.01',
          destToken: aaveV2.mainnetTokens.USDC,
        },
        expects: {
          funds: [aaveV2.mainnetTokens.aWBTC],
          balances: [aaveV2.mainnetTokens.USDC],
          apporveTimes: 2,
          recieves: [aaveV2.mainnetTokens.USDC],
        },
      },
      {
        skip: false,
        testingAccount: '0xA38D6E3Aa9f3E4F81D4cEf9B8bCdC58aB37d066A',
        protocolId: 'radiantv2',
        marketId: 'mainnet',
        params: {
          srcToken: radiantV2.mainnetTokens.WBTC,
          srcAmount: '0.01',
          destToken: radiantV2.mainnetTokens.USDC,
        },
        expects: {
          funds: [radiantV2.mainnetTokens.rWBTC],
          balances: [radiantV2.mainnetTokens.USDC],
          apporveTimes: 2,
          recieves: [radiantV2.mainnetTokens.USDC],
        },
      },
    ];

    for (const [i, { skip, testingAccount, protocolId, marketId, params, expects }] of testCases.entries()) {
      if (skip) continue;
      it.only(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);

        const { estimateResult, buildRouterTransactionRequest } = await adapter.getZapWithdraw(
          protocolId,
          marketId,
          params,
          user.address,
          portfolio
        );

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.funds).to.have.lengthOf(expects.funds.length);
        expect(estimateResult.balances).to.have.lengthOf(expects.balances.length);
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
