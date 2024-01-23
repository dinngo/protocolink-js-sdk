import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import { mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as morphoblue from 'src/protocols/morphoblue/tokens';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

describe('Transaction: Zap Withdraw', function () {
  const chainId = 1;
  const permit2Type = 'approve';
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;
  let service: logics.compoundv3.Service | logics.morphoblue.Service;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
  });

  snapshotAndRevertEach();

  context('Test ZapWithdraw Base', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        srcToken: mainnetTokens.WBTC,
        srcAmount: '1',
        srcAToken: aaveV2.mainnetTokens.aWBTC,
        destToken: mainnetTokens.USDC,
        expects: {
          logicLength: 2,
        },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0x0E79368B079910b31e71Ce1B2AE510461359128D',
        srcToken: mainnetTokens.WBTC,
        srcAmount: '1',
        srcAToken: radiantV2.mainnetTokens.rWBTC,
        destToken: mainnetTokens.USDC,
        expects: {
          logicLength: 2,
        },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        srcToken: mainnetTokens.WBTC,
        srcAmount: '1',
        srcAToken: aaveV3.mainnetTokens.aEthWBTC,
        destToken: mainnetTokens.USDC,
        expects: {
          logicLength: 2,
        },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.ETH,
        account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcAToken: compoundV3.mainnetTokens.cWETHv3,
        destToken: mainnetTokens.USDC,
        expects: {
          logicLength: 2,
        },
      },
    ];

    testCases.forEach(({ protocolId, marketId, account, srcToken, srcAmount, srcAToken, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(account);
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

        // 1. user obtains a quotation for zap withdraw
        const zapWithdrawInfo = await adapter.zapWithdraw({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
        });

        // 2. user needs to permit the Protocolink user agent to withdraw on behalf of the user
        const estimateResult = await apisdk.estimateRouterData(
          { chainId, account, logics: zapWithdrawInfo.logics },
          { permit2Type }
        );
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        // 3. user obtains a zap withdraw transaction request
        expect(zapWithdrawInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics: zapWithdrawInfo.logics,
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
        account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        srcToken: mainnetTokens.WBTC,
        srcAmount: '1',
        destToken: mainnetTokens.USDC,
        expects: {
          logicLength: 2,
        },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        srcToken: morphoblue.mainnetTokens.wstETH,
        srcAmount: '0.0001',
        destToken: mainnetTokens.USDC,
        expects: {
          logicLength: 2,
        },
      },
    ];

    testCases.forEach(({ protocolId, marketId, account, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(account);
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

        if (protocolId === 'compound-v3') {
          service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
        } else if (protocolId === 'morphoblue') {
          service = new logics.morphoblue.Service(chainId, hre.ethers.provider);
        }
        const initCollateralBalance = await service.getCollateralBalance(marketId, user.address, srcToken);

        // 1. user obtains a quotation for zap withdraw
        const zapWithdrawInfo = await adapter.zapWithdraw({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
        });

        // 2. user needs to permit the Protocolink user agent to withdraw on behalf of the user
        const estimateResult = await apisdk.estimateRouterData(
          { chainId, account, logics: zapWithdrawInfo.logics },
          { permit2Type }
        );
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        // 3. user obtains a zap withdraw transaction request
        expect(zapWithdrawInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics: zapWithdrawInfo.logics,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's supply balance should decrease.
        const withdrawalAmount = new common.TokenAmount(srcToken, srcAmount);
        const collateralBalance = await service.getCollateralBalance(marketId, user.address, srcToken);
        expect(initCollateralBalance.clone().sub(collateralBalance).eq(withdrawalAmount)).to.be.true;

        // 5. user's dest token balance should increase
        await expect(user.address).to.changeBalance(destToken, zapWithdrawInfo.destAmount, slippage);
      });
    });
  });
});
