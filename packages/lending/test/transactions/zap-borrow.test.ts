import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Zap Borrow', function () {
  const chainId = 1;
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
  });

  snapshotAndRevertEach();

  context('Test ZapBorrow', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        params: {
          srcToken: mainnetTokens.USDC,
          srcAmount: '1000',
          debtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
          destToken: mainnetTokens.USDT,
        },
        expects: {
          approveTimes: 1,
          logicLength: 2,
        },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0xA38D6E3Aa9f3E4F81D4cEf9B8bCdC58aB37d066A',
        params: {
          srcToken: mainnetTokens.USDC,
          srcAmount: '1000',
          debtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
          destToken: mainnetTokens.USDT,
        },
        expects: {
          approveTimes: 1,
          logicLength: 2,
        },
      },
      {
        account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.USDC,
          srcAmount: '1000',
          debtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
          destToken: mainnetTokens.WBTC,
        },
        expects: {
          approveTimes: 1,
          logicLength: 2,
        },
      },
      {
        account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        params: {
          srcToken: mainnetTokens.USDC,
          srcAmount: '1000',
          destToken: mainnetTokens.USDT,
        },
        expects: {
          approveTimes: 1,
          logicLength: 2,
        },
      },
    ];

    for (const [i, { account, protocolId, marketId, params, expects }] of testCases.entries()) {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(account);
        const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
        const initBorrowBalance =
          protocolId === 'compound-v3'
            ? await service.getBorrowBalance(marketId, user.address, params.srcToken)
            : await getBalance(user.address, params.debtToken!);

        // 1. user obtains a quotation for zap borrow
        const zapBorrowInfo = await adapter.getZapBorrow(protocolId, marketId, params, user.address, portfolio);
        const estimateResult = zapBorrowInfo.estimateResult;

        // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

        // 3. user obtains a zap borrow transaction request
        expect(zapBorrowInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await zapBorrowInfo.buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's borrow balance should increase.
        const borrowBalance =
          protocolId === 'compound-v3'
            ? await service.getBorrowBalance(marketId, user.address, params.srcToken)
            : await getBalance(user.address, params.debtToken!);
        const borrowDifference = borrowBalance.clone().sub(initBorrowBalance);
        const borrowAmount = new common.TokenAmount(params.srcToken, params.srcAmount);

        // 4-1. debt grows when the block of getting api data is different from the block of executing tx
        const [, maxBorrow] = utils.bpsBound(borrowAmount.amount, 500);
        const maxBorrowAmount = borrowAmount.clone().set(maxBorrow);
        expect(borrowDifference.lte(maxBorrowAmount)).to.be.true;
        expect(borrowDifference.gte(borrowAmount)).to.be.true;

        // 5. user's dest token balance should increase
        // 5-1. rate may change when the block of getting api data is different from the block of executing tx
        await expect(user.address).to.changeBalance(params.destToken, zapBorrowInfo.fields.destAmount, slippage);
      });
    }
  });
});
