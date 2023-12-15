import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as common from '@protocolink/common';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import { snapshotAndRevertEach } from '@protocolink/test-helpers';

describe('Transaction: Zap Withdraw', function () {
  const chainId = 1;
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;
  let service: logics.compoundv3.Service;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
    service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
  });

  snapshotAndRevertEach();

  context('Test ZapWithdraw Base', function () {
    const testCases = [
      {
        skip: false,
        testingAccount: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV2.mainnetTokens.WBTC,
          srcAmount: '1',
          destToken: aaveV2.mainnetTokens.USDC,
        },
        expects: {
          funds: [aaveV2.mainnetTokens.aWBTC],
          balances: [aaveV2.mainnetTokens.USDC],
          approveTimes: 2,
          logicLength: 2,
          receives: [aaveV2.mainnetTokens.USDC],
        },
      },
      {
        skip: false,
        testingAccount: '0xA38D6E3Aa9f3E4F81D4cEf9B8bCdC58aB37d066A',
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        params: {
          srcToken: radiantV2.mainnetTokens.WBTC,
          srcAmount: '1',
          destToken: radiantV2.mainnetTokens.USDC,
        },
        expects: {
          funds: [radiantV2.mainnetTokens.rWBTC],
          balances: [radiantV2.mainnetTokens.USDC],
          approveTimes: 2,
          logicLength: 2,
          receives: [radiantV2.mainnetTokens.USDC],
        },
      },
      {
        skip: false,
        testingAccount: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.WBTC,
          srcAmount: '1',
          destToken: aaveV3.mainnetTokens.USDC,
        },
        expects: {
          funds: [aaveV3.mainnetTokens.aEthWBTC],
          balances: [aaveV3.mainnetTokens.USDC],
          approveTimes: 2,
          logicLength: 2,
          receives: [aaveV3.mainnetTokens.USDC],
        },
      },
      // {
      // TODO: UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT
      //   skip: false,
      //   testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
      //   protocolId: 'compound-v3',
      //   marketId: 'ETH',
      //   params: {
      //     srcToken: compoundV3.mainnetTokens.WETH,
      //     srcAmount: '0.001',
      //     destToken: compoundV3.mainnetTokens.USDC,
      //   },
      //   expects: {
      //     funds: [compoundV3.mainnetTokens.cWETHv3],
      //     balances: [compoundV3.mainnetTokens.USDC],
      //     approveTimes: 2,
      //     logicLength: 2,
      //     receives: [compoundV3.mainnetTokens.USDC],
      //   },
      // },
      // {
      //   skip: false,
      //   testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
      //   protocolId: 'compound-v3',
      //   marketId: 'ETH',
      //   params: {
      //     srcToken: compoundV3.mainnetTokens.ETH, // TODO: native token will fail
      //     srcAmount: '0.001',
      //     destToken: compoundV3.mainnetTokens.USDC,
      //   },
      //   expects: {
      //     funds: [compoundV3.mainnetTokens.cWETHv3],
      //     balances: [compoundV3.mainnetTokens.USDC],
      //     approveTimes: 2,
      //     logicLength: 2,
      //     receives: [compoundV3.mainnetTokens.USDC],
      //   },
      // },
    ];

    for (const [i, { skip, testingAccount, protocolId, marketId, params, expects }] of testCases.entries()) {
      if (skip) continue;

      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);

        // 1. user obtains a quotation for zap withdraw
        const { estimateResult, buildRouterTransactionRequest, fields } = await adapter.getZapWithdraw(
          protocolId,
          marketId,
          params,
          user.address,
          portfolio
        );

        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.funds).to.have.lengthOf(expects.funds.length);
        expect(estimateResult.balances).to.have.lengthOf(expects.balances.length);

        // 3. user obtains a zap withdraw transaction request
        const transactionRequest = await buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's supply balance should decrease.
        // 4-1. supply grows when the block of getting api data is different from the block of executing tx
        await expect(user.address).to.changeBalance(params.srcToken, -params.srcAmount, slippage);

        // 5. user's dest token balance should increase
        await expect(user.address).to.changeBalance(params.destToken, fields.destAmount, slippage);
      });
    }
  });

  context('Test ZapWithdraw Collateral', function () {
    const testCases = [
      {
        // TODO: UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT
        skip: true,
        testingAccount: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        protocolId: 'compound-v3',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.ETH,
          srcAmount: '0.0001',
          destToken: compoundV3.mainnetTokens.USDC,
        },
        expects: {
          funds: [],
          balances: [compoundV3.mainnetTokens.USDC],
          approveTimes: 1,
          logicLength: 2,
          receives: [compoundV3.mainnetTokens.USDC],
        },
      },
    ];

    for (const [i, { skip, testingAccount, protocolId, marketId, params, expects }] of testCases.entries()) {
      if (skip) continue;

      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);
        const srcToken = params.srcToken;
        const initCollateralBalance = await service.getCollateralBalance(marketId, user.address, srcToken);

        // 1. user obtains a quotation for zap withdraw
        const { estimateResult, buildRouterTransactionRequest, fields } = await adapter.getZapWithdraw(
          protocolId,
          marketId,
          params,
          user.address,
          portfolio
        );

        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.funds).to.have.lengthOf(expects.funds.length);
        expect(estimateResult.balances).to.have.lengthOf(expects.balances.length);

        // 3. user obtains a zap withdraw transaction request
        const transactionRequest = await buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's supply balance should decrease.
        const withdrawalAmount = new common.TokenAmount(srcToken, params.srcAmount);
        const collateralBalance = await service.getCollateralBalance(marketId, user.address, srcToken);
        expect(initCollateralBalance.clone().sub(collateralBalance).eq(withdrawalAmount)).to.be.true;

        // 5. user's dest token balance should increase
        await expect(user.address).to.changeBalance(params.destToken, fields.destAmount, slippage);
      });
    }
  });
});
