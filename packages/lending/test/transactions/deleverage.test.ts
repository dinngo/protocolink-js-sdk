import { Adapter } from 'src/adapter';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as morphoblue from 'src/protocols/morphoblue/tokens';
import * as utils from 'test/utils';

describe('Transaction: Deleverage', function () {
  const chainId = 1;
  const initSupplyAmount = '5';
  const initBorrowAmount = '1000';
  const slippage = 1000;

  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, initSupplyAmount);
    await claimToken(chainId, user.address, logics.morphoblue.mainnetTokens.wstETH, initSupplyAmount);
  });

  snapshotAndRevertEach();

  context('Test Deleverage build positions', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        srcToken: mainnetTokens.DAI,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: { logicLength: 6 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        // 0. prep user positions
        const account = user.address;
        const protocol = adapter.getProtocol(protocolId);
        const initCollateralBalance = new common.TokenAmount(destToken, initSupplyAmount);
        const initBorrowBalance = new common.TokenAmount(srcToken, initBorrowAmount);
        await utils.deposit(chainId, protocolId, marketId, user, initCollateralBalance);
        await utils.borrow(chainId, protocolId, marketId, user, initBorrowBalance);

        // 1. user obtains a quotation for deleveraging dest token
        const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const deleverageInfo = await adapter.deleverage({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
          slippage,
        });
        const logics = deleverageInfo.logics;
        expect(deleverageInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);

        // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        // 2-1. user sign permit data
        const permitData = estimateResult.permitData;
        expect(permitData).to.not.be.undefined;
        const { domain, types, values } = permitData!;
        const permitSig = await user._signTypedData(domain, types, values);

        // 3. user obtains a deleverage transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics,
          permitData,
          permitSig,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's collateral balance should decrease.
        // 4-1. collateral grows when the block of getting api data is different from the block of executing tx
        const deleverageWithdrawAmount = deleverageInfo.destAmount;
        const collateralBalance = await utils.getCollateralBalance(chainId, protocol, marketId, user, destToken);
        const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, srcToken);
        expect(collateralBalance!.gte(initCollateralBalance.clone().sub(deleverageWithdrawAmount))).to.be.true;

        // 5. user's borrow balance should decrease.
        const borrowDifference = initBorrowBalance.clone().sub(borrowBalance!.amount);
        const repayAmount = logics[2].fields.input;

        // 5-1. debt grows when the block of getting api data is different from the block of executing tx
        utils.expectEqWithinBps(borrowDifference!.amountWei, repayAmount.amountWei, slippage);
      });
    });
  });

  context('Test Deleverage on-chain positions', function () {
    const testCases = [
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.ETH,
        account: '0x4aab5cbfe493fc2ac18c46a68ef42c58ba06c9bd',
        srcToken: mainnetTokens.ETH,
        srcAmount: '0.1',
        destToken: morphoblue.mainnetTokens.wstETH,
        expects: { logicLength: 5 },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        account: '0x4aab5cbfe493fc2ac18c46a68ef42c58ba06c9bd',
        srcToken: mainnetTokens.WETH,
        srcAmount: '0.01',
        destToken: morphoblue.mainnetTokens.wstETH,
        expects: { logicLength: 5 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, account, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const permit2Type = 'approve';
        const protocol = adapter.getProtocol(protocolId);

        user = await hre.ethers.getImpersonatedSigner(account);
        const initCollateralBalance = await utils.getCollateralBalance(chainId, protocol, marketId, user, destToken);
        const initBorrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, srcToken);

        // 1. user obtains a quotation for deleveraging dest token
        const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const deleverageInfo = await adapter.deleverage({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
          slippage,
        });
        const logics = deleverageInfo.logics;
        expect(deleverageInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);

        // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics }, { permit2Type });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult.permitData).to.be.undefined;

        // 3. user obtains a deleverage transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({ chainId, account, logics });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's collateral balance should decrease.
        // 4-1. collateral grows when the block of getting api data is different from the block of executing tx
        const deleverageWithdrawAmount = deleverageInfo.destAmount;
        const collateralBalance = await utils.getCollateralBalance(chainId, protocol, marketId, user, destToken);
        const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, srcToken);
        expect(collateralBalance!.gte(initCollateralBalance!.clone().sub(deleverageWithdrawAmount))).to.be.true;

        // 5. user's borrow balance should decrease.
        const borrowDifference = initBorrowBalance!.clone().sub(borrowBalance!.amount);
        const repayAmount = logics[2].fields.input;

        // 5-1. debt grows when the block of getting api data is different from the block of executing tx
        utils.expectEqWithinBps(borrowDifference!.amountWei, repayAmount.amountWei, slippage);
      });
    });
  });
});
