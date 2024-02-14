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
import * as morphoblue from 'src/protocols/morphoblue/tokens';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import { spark } from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Zap Supply', function () {
  const chainId = 1;
  const slippage = 100;

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
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WBTC,
        destAToken: radiantV2.mainnetTokens.rWBTC,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WBTC,
        destAToken: aaveV3.mainnetTokens.aEthWBTC,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        destAToken: spark.mainnetTokens.spWETH,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.ETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        destAToken: compoundV3.mainnetTokens.cWETHv3,
        expects: { logicLength: 2 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, srcToken, srcAmount, destToken, destAToken, expects }, i) => {
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
        const collateralBalance = await utils.getCollateralBalance(chainId, protocolId, marketId, user, destToken);
        const supplyDestAmount = new common.TokenAmount(destToken, zapDepositInfo.destAmount);

        // 4-1. rate may change when the block of getting api data is different from the block of executing tx
        const [minDestAmount, maxDestAmount] = utils.bpsBound(supplyDestAmount.amount);
        expect(collateralBalance!.lte(maxDestAmount)).to.be.true;
        expect(collateralBalance!.gte(minDestAmount)).to.be.true;
      });
    });
  });
});
