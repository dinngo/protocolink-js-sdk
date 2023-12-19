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
import { mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

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
        account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.WBTC,
          srcAmount: '1',
          destToken: mainnetTokens.USDC,
        },
        expects: {
          funds: [aaveV2.mainnetTokens.aWBTC],
          balances: [mainnetTokens.USDC],
          approveTimes: 2,
          logicLength: 2,
        },
      },
      {
        account: '0xA38D6E3Aa9f3E4F81D4cEf9B8bCdC58aB37d066A',
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.WBTC,
          srcAmount: '1',
          destToken: mainnetTokens.USDC,
        },
        expects: {
          funds: [radiantV2.mainnetTokens.rWBTC],
          balances: [mainnetTokens.USDC],
          approveTimes: 2,
          logicLength: 2,
        },
      },
      {
        account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.WBTC,
          srcAmount: '1',
          destToken: mainnetTokens.USDC,
        },
        expects: {
          funds: [aaveV3.mainnetTokens.aEthWBTC],
          balances: [mainnetTokens.USDC],
          approveTimes: 2,
          logicLength: 2,
        },
      },
      {
        account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.ETH,
        params: {
          srcToken: mainnetTokens.WETH,
          srcAmount: '1',
          destToken: mainnetTokens.USDC,
        },
        expects: {
          funds: [compoundV3.mainnetTokens.cWETHv3],
          balances: [mainnetTokens.USDC],
          approveTimes: 2,
          logicLength: 2,
        },
      },
      // {
      // TODO: expected -2001723699096239 to be at most -990000000000000000. The numerical values of the given "ethers.BigNumber" and "ethers.BigNumber" inputs were compared, and they differed.
      //   account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
      //   protocolId: 'compound-v3',
      //   marketId: 'ETH',
      //   params: {
      //     srcToken: compoundV3.mainnetTokens.ETH, // TODO: native token will fail
      //     srcAmount: '1',
      //     destToken: compoundV3.mainnetTokens.USDC,
      //   },
      //   expects: {
      //     funds: [compoundV3.mainnetTokens.cWETHv3],
      //     balances: [compoundV3.mainnetTokens.USDC],
      //     approveTimes: 2,
      //     logicLength: 2,
      //   },
      // },
    ];

    for (const [i, { account, protocolId, marketId, params, expects }] of testCases.entries()) {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(account);

        // 1. user obtains a quotation for zap withdraw
        const zapWithdrawInfo = await adapter.zapWithdraw(protocolId, marketId, params, user.address, portfolio);
        const estimateResult = zapWithdrawInfo.estimateResult;

        // 2. user needs to permit the Protocolink user agent to withdraw on behalf of the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.funds).to.have.lengthOf(expects.funds.length);
        expect(estimateResult.balances).to.have.lengthOf(expects.balances.length);

        // 3. user obtains a zap withdraw transaction request
        expect(zapWithdrawInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await zapWithdrawInfo.buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's supply balance should decrease.
        // 4-1. supply grows when the block of getting api data is different from the block of executing tx
        await expect(user.address).to.changeBalance(params.srcToken, -params.srcAmount, slippage);

        // 5. user's dest token balance should increase
        await expect(user.address).to.changeBalance(params.destToken, zapWithdrawInfo.fields.destAmount, slippage);
      });
    }
  });

  context('Test ZapWithdraw Collateral', function () {
    const testCases = [
      {
        account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        params: {
          srcToken: compoundV3.mainnetTokens.WBTC,
          srcAmount: '1',
          destToken: compoundV3.mainnetTokens.USDC,
        },
        expects: {
          funds: [],
          balances: [compoundV3.mainnetTokens.USDC],
          approveTimes: 1,
          logicLength: 2,
        },
      },
    ];

    for (const [i, { account, protocolId, marketId, params, expects }] of testCases.entries()) {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(account);
        const srcToken = params.srcToken;
        const initCollateralBalance = await service.getCollateralBalance(marketId, user.address, srcToken);

        // 1. user obtains a quotation for zap withdraw
        const zapWithdrawInfo = await adapter.zapWithdraw(protocolId, marketId, params, user.address, portfolio);
        const estimateResult = zapWithdrawInfo.estimateResult;

        // 2. user needs to permit the Protocolink user agent to withdraw on behalf of the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.funds).to.have.lengthOf(expects.funds.length);
        expect(estimateResult.balances).to.have.lengthOf(expects.balances.length);

        // 3. user obtains a zap withdraw transaction request
        expect(zapWithdrawInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await zapWithdrawInfo.buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's supply balance should decrease.
        const withdrawalAmount = new common.TokenAmount(srcToken, params.srcAmount);
        const collateralBalance = await service.getCollateralBalance(marketId, user.address, srcToken);
        expect(initCollateralBalance.clone().sub(collateralBalance).eq(withdrawalAmount)).to.be.true;

        // 5. user's dest token balance should increase
        await expect(user.address).to.changeBalance(params.destToken, zapWithdrawInfo.fields.destAmount, slippage);
      });
    }
  });
});
