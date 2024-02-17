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

describe('Transaction: Zap Supply', function () {
  const chainId = 1;
  const slippage = 1000;

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
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WBTC,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WBTC,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.ETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: { logicLength: 2 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const account = user.address;

        // 1. user obtains a quotation for zap supply
        const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const zapDepositInfo = await adapter.zapSupply({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
          slippage,
        });
        const logics = zapDepositInfo.logics;
        expect(zapDepositInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);

        // 2. user needs to permit the Protocolink user agent to supply for the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        const permitData = estimateResult.permitData;
        expect(permitData).to.not.be.undefined;
        // 2-1. user sign permit data
        const { domain, types, values } = permitData!;
        const permitSig = await user._signTypedData(domain, types, values);

        // 3. user obtains a zap supply transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics,
          permitData,
          permitSig,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's balance will increase.
        const protocol = adapter.getProtocol(protocolId);
        const destAToken = protocol.toProtocolToken(marketId, destToken);
        await expect(user.address).to.changeBalance(destAToken, zapDepositInfo.destAmount, slippage);
      });
    });
  });

  context('Test Zap Supply Collateral', function () {
    const testCases = [
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: morphoblue.mainnetTokens.wstETH,
        expects: { logicLength: 2 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const account = user.address;

        // 1. user obtains a quotation for zap supply
        const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const zapDepositInfo = await adapter.zapSupply({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
          slippage,
        });
        const logics = zapDepositInfo.logics;
        expect(zapDepositInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);

        // 2. user needs to permit the Protocolink user agent to supply for the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        const permitData = estimateResult.permitData!;
        const { domain, types, values } = permitData;
        const permitSig = await user._signTypedData(domain, types, values);

        // 3. user obtains a zap supply transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics,
          permitData,
          permitSig,
        });

        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's balance will increase.
        const protocol = adapter.getProtocol(protocolId);
        const collateralBalance = await utils.getCollateralBalance(chainId, protocol, marketId, user, destToken);
        const supplyDestAmount = new common.TokenAmount(destToken, zapDepositInfo.destAmount);

        // 4-1. rate may change when the block of getting api data is different from the block of executing tx
        utils.expectEqWithinBps(collateralBalance!.amountWei, supplyDestAmount.amountWei, slippage);
      });
    });
  });
});
