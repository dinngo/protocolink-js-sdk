import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
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
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import * as utils from 'test/utils';

describe('Transaction: Zap Supply', function () {
  const chainId = 1;
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.USDC, '1000');
  });

  snapshotAndRevertEach();

  context('Test Zap Supply Base', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WBTC,
        destAToken: aaveV2.mainnetTokens.aWBTC,
        expects: {
          approvalLength: 1,
          logicLength: 2,
        },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WBTC,
        destAToken: radiantV2.mainnetTokens.rWBTC,
        expects: {
          approvalLength: 1,
          logicLength: 2,
        },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WBTC,
        destAToken: aaveV3.mainnetTokens.aEthWBTC,
        expects: {
          approvalLength: 1,
          logicLength: 2,
        },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.ETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        destAToken: compoundV3.mainnetTokens.cWETHv3,
        expects: {
          approvalLength: 1,
          logicLength: 2,
        },
      },
    ];

    for (const [
      i,
      { protocolId, marketId, srcToken, srcAmount, destToken, destAToken, expects },
    ] of testCases.entries()) {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const account = user.address;
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

        // 1. user obtains a quotation for zap supply
        const zapDepositInfo = await adapter.zapSupply({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
        });

        // 2. user needs to permit the Protocolink user agent to supply for the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics: zapDepositInfo.logics });
        expect(estimateResult.approvals.length).to.eq(expects.approvalLength);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        const permitData = estimateResult.permitData;
        expect(permitData).to.not.be.undefined;
        const { domain, types, values } = permitData!;
        const permitSig = await user._signTypedData(domain, types, values);

        // 3. user obtains a zap supply transaction request
        expect(zapDepositInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics: zapDepositInfo.logics,
          permitData,
          permitSig,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's balance will increase.
        await expect(user.address).to.changeBalance(destAToken, zapDepositInfo.destAmount, slippage);
      });
    }
  });

  context('Test Zap Supply Collateral', function () {
    const testCases = [
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: {
          approvalLength: 1,
          logicLength: 2,
        },
      },
    ];

    for (const [i, { protocolId, marketId, srcToken, srcAmount, destToken, expects }] of testCases.entries()) {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const account = user.address;
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

        // 1. user obtains a quotation for zap supply
        const zapDepositInfo = await adapter.zapSupply({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
        });

        // 2. user needs to permit the Protocolink user agent to supply for the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics: zapDepositInfo.logics });
        expect(estimateResult.approvals.length).to.eq(expects.approvalLength);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        const permitData = estimateResult.permitData;
        expect(permitData).to.not.be.undefined;
        const { domain, types, values } = permitData!;
        const permitSig = await user._signTypedData(domain, types, values);

        // 3. user obtains a zap supply transaction request
        expect(zapDepositInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics: zapDepositInfo.logics,
          permitData,
          permitSig,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's balance will increase.
        const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
        const collateralBalance = await service.getCollateralBalance(marketId, user.address, destToken);
        const supplyDestAmount = new common.TokenAmount(destToken, zapDepositInfo.destAmount);

        // 4-1. rate may change when the block of getting api data is different from the block of executing tx
        const [min, max] = utils.bpsBound(supplyDestAmount.amount);
        const maxDestAmount = supplyDestAmount.clone().set(max);
        const minDestAmount = supplyDestAmount.clone().set(min);

        expect(collateralBalance.lte(maxDestAmount)).to.be.true;
        expect(collateralBalance.gte(minDestAmount)).to.be.true;
      });
    }
  });
});
