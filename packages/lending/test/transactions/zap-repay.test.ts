import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Zap Repay', function () {
  const chainId = 1;
  const slippage = 1000;
  const initSupplyAmount = '1';

  let user: SignerWithAddress;
  let adapter: Adapter;
  let portfolio: Portfolio;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, mainnetTokens.WETH, initSupplyAmount);
    await claimToken(chainId, user.address, mainnetTokens.USDT, '500');
    await claimToken(chainId, '0x4aab5cbfe493fc2ac18c46a68ef42c58ba06c9bd', mainnetTokens.USDT, '500');
  });

  snapshotAndRevertEach();

  context('Test ZapRepay build positions', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.USDT,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.USDT,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.USDT,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.DAI,
        srcAmount: '100',
        destToken: mainnetTokens.USDT,
        expects: { logicLength: 2 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, supplyToken, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        // 0. prep user positions
        const account = user.address;
        await utils.deposit(chainId, protocolId, marketId, user, new common.TokenAmount(supplyToken, initSupplyAmount));
        await utils.borrow(chainId, protocolId, marketId, user, new common.TokenAmount(srcToken, srcAmount));

        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const initBorrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, srcToken);

        // 1. user obtains a quotation for zap repay
        const zapRepayInfo = await adapter.zapRepay({ account, portfolio, srcToken, srcAmount, destToken, slippage });
        const logics = zapRepayInfo.logics;
        expect(zapRepayInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);

        // 2. user needs to allow the Protocolink user agent to repay on behalf of the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        const permitData = estimateResult.permitData;
        expect(permitData).to.not.be.undefined;
        // 2-1. user sign permit data
        const { domain, types, values } = permitData!;
        const permitSig = await user._signTypedData(domain, types, values);

        // 3. user obtains a zap repay transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics,
          permitData,
          permitSig,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's borrow balance should decrease
        // 4-1. debt grows when the block of getting api data is different from the block of executing tx
        const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, srcToken);
        const repayAmount = logics[1].fields.input;
        const borrowDifference = initBorrowBalance!.clone().sub(borrowBalance!);
        utils.expectEqWithinBps(borrowDifference!.amountWei, repayAmount.amountWei, slippage);

        // 5. user's dest token balance should decrease
        await expect(user.address).to.changeBalance(destToken, -zapRepayInfo.destAmount, 1);
      });
    });
  });

  context('Test ZapRepay on-chain positions', function () {
    const testCases = [
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.ETH,
        account: '0x4aab5cbfe493fc2ac18c46a68ef42c58ba06c9bd',
        srcToken: mainnetTokens.ETH,
        srcAmount: '0.1',
        destToken: mainnetTokens.USDT,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        account: '0x4aab5cbfe493fc2ac18c46a68ef42c58ba06c9bd',
        srcToken: mainnetTokens.WETH,
        srcAmount: '0.01',
        destToken: mainnetTokens.USDT,
        expects: { logicLength: 2 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, account, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const permit2Type = 'approve';

        user = await hre.ethers.getImpersonatedSigner(account);
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const initBorrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, srcToken);

        // 1. user obtains a quotation for zap repay
        const zapRepayInfo = await adapter.zapRepay({ account, portfolio, srcToken, srcAmount, destToken, slippage });
        const logics = zapRepayInfo.logics;
        expect(zapRepayInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);

        // 2. user needs to allow the Protocolink user agent to repay on behalf of the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics }, { permit2Type });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        // 3. user obtains a zap repay transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({ chainId, account, logics });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's borrow balance should decrease
        // 4-1. debt grows when the block of getting api data is different from the block of executing tx
        const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, srcToken);
        const repayAmount = logics[1].fields.input;
        const borrowDifference = initBorrowBalance!.clone().sub(borrowBalance!);
        utils.expectEqWithinBps(borrowDifference!.amountWei, repayAmount.amountWei, slippage);

        // 5. user's dest token balance should decrease
        await expect(user.address).to.changeBalance(destToken, -zapRepayInfo.destAmount, 1);
      });
    });
  });
});
