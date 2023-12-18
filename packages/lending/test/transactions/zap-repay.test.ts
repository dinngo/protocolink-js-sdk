import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Zap Repay', function () {
  const chainId = 1;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;
  let initBorrowBalance: common.TokenAmount;
  let service: logics.compoundv3.Service;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
    await claimToken(chainId, '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111', mainnetTokens.USDT, '2000');
  });

  snapshotAndRevertEach();

  context('Test ZapRepay', function () {
    const testCases = [
      // {
      //   // TODO: expect(borrowDifference.gte(minRepayAmount)).to.be.true;
      //   protocolId: 'aave-v2',
      //   marketId: 'mainnet',
      //   account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
      //   params: {
      //     srcToken: mainnetTokens.USDT,
      //     srcAmount: '1000',
      //     debtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
      //     destToken: mainnetTokens.USDC,
      //   },
      //   expects: {
      //     approveTimes: 2,
      //     logicLength: 2,
      //   },
      // },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e',
        params: {
          srcToken: mainnetTokens.USDT,
          srcAmount: '1000',
          debtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
          destToken: mainnetTokens.USDC,
        },
        expects: {
          approveTimes: 2,
          logicLength: 2,
        },
      },
      // {
      //   // TODO: ERC20: transfer amount exceeds balance (1 wei issue?)
      //   protocolId: 'aave-v3',
      //   marketId: 'mainnet',
      //   account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
      //   params: {
      //     srcToken: mainnetTokens.USDT,
      //     srcAmount: '1000',
      //     debtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
      //     destToken: mainnetTokens.USDC,
      //   },
      //   expects: {
      //     approveTimes: 2,
      //     logicLength: 2,
      //   },
      // },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        params: {
          srcToken: mainnetTokens.USDT,
          srcAmount: '1000',
          destToken: mainnetTokens.USDC,
        },
        expects: {
          approveTimes: 2,
          logicLength: 2,
        },
      },
    ];

    for (const [i, { protocolId, marketId, account, params, expects }] of testCases.entries()) {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(account);
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        if (protocolId === 'compound-v3') {
          service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
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
        // TODO: move to unit test
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

        // 3. user obtains a zap repay transaction request
        expect(zapRepayInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await zapRepayInfo.buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's borrow balance should decrease
        // 4-1. debt grows when the block of getting api data is different from the block of executing tx
        const borrowBalance =
          protocolId === 'compound-v3'
            ? await service.getBorrowBalance(marketId, user.address, params.destToken)
            : await getBalance(user.address, params.debtToken!);
        const repayAmount = new common.TokenAmount(params.destToken, zapRepayInfo.fields.destAmount);
        const borrowDifference = initBorrowBalance.clone().sub(borrowBalance);

        const [minRepay] = utils.bpsBound(repayAmount.amount, 100);
        const minRepayAmount = repayAmount.clone().set(minRepay);
        expect(borrowDifference.gte(minRepayAmount)).to.be.true;
        expect(borrowDifference.lte(repayAmount)).to.be.true;

        // 6. user's src token balance should decrease
        await expect(user.address).to.changeBalance(params.srcToken, -params.srcAmount);
      });
    }
  });
});
