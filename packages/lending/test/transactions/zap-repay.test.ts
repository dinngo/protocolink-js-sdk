import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import { claimToken, getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import * as utils from 'test/utils';

describe('Transaction: Zap Repay', function () {
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;
  let initBorrowBalance: common.TokenAmount;

  const chainId = 1;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
    await claimToken(chainId, '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E', aaveV2.mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e', aaveV2.mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550', aaveV2.mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111', aaveV2.mainnetTokens.USDT, '2000');
  });

  snapshotAndRevertEach();

  context('Test ZapRepay', function () {
    const testCases = [
      {
        skip: true,
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        testingAccount: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        params: {
          srcToken: aaveV2.mainnetTokens.USDT,
          srcAmount: '1000',
          debtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
          destToken: aaveV2.mainnetTokens.USDC,
        },
        expects: {
          approveTimes: 2,
          logicLength: 2,
        },
      },
      // {
      //   skip: false,
      //   protocolId: 'radiant-v2',
      //   marketId: 'mainnet',
      //   testingAccount: '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e',
      //   params: {
      //     srcToken: radiantV2.mainnetTokens.USDT,
      //     srcAmount: '1000',
      //     debtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
      //     destToken: radiantV2.mainnetTokens.USDC,
      //   },
      //   expects: {
      //     approveTimes: 2,
      //     logicLength: 2,
      //   },
      // },
      // {
      //   skip: false,
      //   protocolId: 'aave-v3',
      //   marketId: 'mainnet',
      //   testingAccount: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
      //   params: {
      //     srcToken: aaveV3.mainnetTokens.USDT,
      //     srcAmount: '1000',
      //     debtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
      //     destToken: aaveV3.mainnetTokens.USDC,
      //   },
      //   expects: {
      //     approveTimes: 2,
      //     logicLength: 2,
      //   },
      // },
      // {
      //   // TODO: ERC20: transfer amount exceeds balance
      //   skip: true,
      //   protocolId: 'compound-v3',
      //   marketId: 'USDC',
      //   testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
      //   params: {
      //     srcToken: aaveV2.mainnetTokens.USDT,
      //     srcAmount: '1000',
      //     destToken: compoundV3.mainnetTokens.USDC,
      //   },
      //   expects: {
      //     approveTimes: 2,
      //     logicLength: 2,
      //   },
      // },
    ];

    for (const [i, { skip, protocolId, marketId, testingAccount, params, expects }] of testCases.entries()) {
      if (skip) continue;

      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
        if (protocolId === 'compound-v3') {
          initBorrowBalance = await service.getBorrowBalance(marketId, user.address, params.destToken);
        } else {
          initBorrowBalance = await getBalance(user.address, params.debtToken!);
        }

        // 1. user obtains a quotation for zap repay
        const zapRepayInfo = await adapter.getZapRepay(protocolId, marketId, params, user.address, portfolio);
        const estimateResult = zapRepayInfo.estimateResult;

        // 2. user needs to allow the Protocolink user agent to repay on behalf of the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

        // 3. user obtains a zap repay transaction request
        expect(zapRepayInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await zapRepayInfo.buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's borrow balance should decrease
        const borrowBalance =
          protocolId === 'compound-v3'
            ? await service.getBorrowBalance(marketId, user.address, params.destToken)
            : await getBalance(user.address, params.debtToken!);
        const repayAmount = new common.TokenAmount(params.destToken, zapRepayInfo.fields.destAmount);
        const borrowDifference = initBorrowBalance.clone().sub(borrowBalance);

        // 4-1. debt grows when the block of getting api data is different from the block of executing tx
        const [minRepay] = utils.bpsBound(repayAmount.amount, 10);
        const minRepayAmount = repayAmount.clone().set(minRepay);
        expect(borrowDifference.gte(minRepayAmount)).to.be.true;
        expect(borrowDifference.lte(repayAmount)).to.be.true;

        // 6. user's src token balance should decrease
        await expect(user.address).to.changeBalance(params.srcToken, -params.srcAmount);
      });
    }
  });
});
