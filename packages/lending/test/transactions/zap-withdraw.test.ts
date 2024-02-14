import { Adapter } from 'src/adapter';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as apisdk from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import { morphoblue, spark } from '@protocolink/logics';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import * as utils from '../utils';

describe('Transaction: Zap Withdraw', function () {
  const chainId = 1;
  const slippage = 100;
  const initSupplyAmount = '2';

  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, initSupplyAmount);
    await claimToken(chainId, user.address, morphoblue.mainnetTokens.wstETH, initSupplyAmount);
  });

  snapshotAndRevertEach();

  context('Test ZapWithdraw Base', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcAToken: aaveV2.mainnetTokens.aWETH,
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcAToken: radiantV2.mainnetTokens.rWETH,
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcAToken: aaveV3.mainnetTokens.aEthWETH,
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcAToken: spark.mainnetTokens.spWETH,
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.ETH,
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcAToken: compoundV3.mainnetTokens.cWETHv3,
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 2 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, srcToken, srcAmount, srcAToken, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        // 0. prep user positions
        const account = user.address;
        await utils.deposit(
          chainId,
          protocolId,
          marketId,
          user,
          new common.TokenAmount(srcToken.wrapped, initSupplyAmount)
        );

        // 1. user obtains a quotation for zap withdraw
        const portfolio = await adapter.getPortfolio(account, protocolId, marketId);
        const zapWithdrawInfo = await adapter.zapWithdraw({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
        });
        const logics = zapWithdrawInfo.logics;
        expect(zapWithdrawInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);

        // 2. user needs to permit the Protocolink user agent to withdraw on behalf of the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        const permitData = estimateResult.permitData;
        expect(permitData).to.not.be.undefined;
        // 2-1. user sign permit data
        const { domain, types, values } = permitData!;
        const permitSig = await user._signTypedData(domain, types, values);

        // 3. user obtains a zap withdraw transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics,
          permitData,
          permitSig,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's supply balance should decrease.
        // 4-1. supply grows when the block of getting api data is different from the block of executing tx
        await expect(user.address).to.changeBalance(srcAToken, -srcAmount, slippage);

        // 5. user's dest token balance should increase
        await expect(user.address).to.changeBalance(destToken, zapWithdrawInfo.destAmount, slippage);
      });
    });
  });

  context('Test ZapWithdraw Collateral', function () {
    const testCases = [
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        srcToken: morphoblue.mainnetTokens.wstETH,
        srcAmount: '1',
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 2 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        // 0. prep user position
        const account = user.address;
        await utils.deposit(
          chainId,
          protocolId,
          marketId,
          user,
          new common.TokenAmount(srcToken.wrapped, initSupplyAmount)
        );

        // 1. user obtains a quotation for zap withdraw
        const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const zapWithdrawInfo = await adapter.zapWithdraw({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
        });
        const logics = zapWithdrawInfo.logics;
        expect(zapWithdrawInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);

        // 2. user needs to permit the Protocolink user agent to withdraw on behalf of the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        const permitData = estimateResult.permitData;
        expect(permitData).to.be.undefined;

        // 3. user obtains a zap withdraw transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's supply balance should decrease.
        const withdrawalAmount = new common.TokenAmount(srcToken, srcAmount);
        const collateralBalance = await utils.getCollateralBalance(chainId, protocolId, marketId, user, srcToken);
        expect(collateralBalance!.add(withdrawalAmount).amount).to.be.eq(initSupplyAmount);

        // 5. user's dest token balance should increase
        await expect(user.address).to.changeBalance(destToken, zapWithdrawInfo.destAmount, slippage);
      });
    });
  });
});
