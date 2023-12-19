import { Adapter } from 'src/adapter';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import { claimToken, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import * as utils from 'test/utils';

describe('Transaction: Zap Supply', function () {
  let user: SignerWithAddress;
  let adapter: Adapter;

  const chainId = 1;
  const slippage = 100;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, aaveV3.mainnetTokens.USDC, '1000');
  });

  snapshotAndRevertEach();

  context('Test Zap Supply Base', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV2.mainnetTokens.USDC,
          srcAmount: '100',
          destToken: aaveV2.mainnetTokens.WBTC,
        },
        expects: {
          funds: [aaveV2.mainnetTokens.USDC],
          balances: [aaveV2.mainnetTokens.aWBTC],
          approveTimes: 1,
          logicLength: 2,
          aToken: aaveV2.mainnetTokens.aWBTC,
        },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.USDC,
          srcAmount: '100',
          destToken: aaveV3.mainnetTokens.WBTC,
        },
        expects: {
          funds: [aaveV3.mainnetTokens.USDC],
          balances: [aaveV3.mainnetTokens.aEthWBTC],
          approveTimes: 1,
          logicLength: 2,
          aToken: aaveV3.mainnetTokens.aEthWBTC,
        },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        params: {
          srcToken: radiantV2.mainnetTokens.USDC,
          srcAmount: '100',
          destToken: radiantV2.mainnetTokens.WBTC,
        },
        expects: {
          funds: [radiantV2.mainnetTokens.USDC],
          balances: [radiantV2.mainnetTokens.rWBTC],
          approveTimes: 1,
          logicLength: 2,
          aToken: radiantV2.mainnetTokens.rWBTC,
        },
      },
      {
        protocolId: 'compound-v3',
        marketId: 'ETH',
        params: {
          srcToken: compoundV3.mainnetTokens.USDC,
          srcAmount: '100',
          destToken: compoundV3.mainnetTokens.WETH,
        },
        expects: {
          funds: [compoundV3.mainnetTokens.USDC],
          balances: [compoundV3.mainnetTokens.cWETHv3],
          approveTimes: 1,
          logicLength: 2,
          aToken: compoundV3.mainnetTokens.cWETHv3,
        },
      },
    ];

    for (const [i, { protocolId, marketId, params, expects }] of testCases.entries()) {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        // 1. user obtains a quotation for zap supply
        const zapDepositInfo = await adapter.zapSupply(protocolId, marketId, params, user.address);
        const estimateResult = zapDepositInfo.estimateResult;

        // 2. user needs to permit the Protocolink user agent to supply for the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        const permitData = estimateResult.permitData;
        expect(permitData).to.not.be.undefined;
        const { domain, types, values } = permitData!;
        const permitSig = await user._signTypedData(domain, types, values);

        // TODO: move to unit test
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.funds).to.have.lengthOf(expects.funds.length);
        expect(estimateResult.balances).to.have.lengthOf(expects.balances.length);

        // 3. user obtains a zap supply transaction request
        expect(zapDepositInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await zapDepositInfo.buildRouterTransactionRequest({
          permitData,
          permitSig,
        });
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's balance will increase.
        await expect(user.address).to.changeBalance(expects.aToken, zapDepositInfo.fields.destAmount, slippage);
      });
    }
  });

  context('Test Zap Supply Collateral', function () {
    const testCases = [
      {
        protocolId: 'compound-v3',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.USDC,
          srcAmount: '100',
          destToken: compoundV3.mainnetTokens.WETH,
        },
        expects: {
          funds: [compoundV3.mainnetTokens.WETH],
          balances: [],
          approveTimes: 1,
          logicLength: 2,
        },
      },
    ];

    for (const [i, { protocolId, marketId, params, expects }] of testCases.entries()) {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        // 1. user obtains a quotation for zap supply
        const zapDepositInfo = await adapter.zapSupply(protocolId, marketId, params, user.address);
        const estimateResult = zapDepositInfo.estimateResult;

        // 2. user needs to permit the Protocolink user agent to supply for the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        const permitData = estimateResult.permitData;
        expect(permitData).to.not.be.undefined;
        const { domain, types, values } = permitData!;
        const permitSig = await user._signTypedData(domain, types, values);

        // TODO: move to unit test
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.funds).to.have.lengthOf(expects.funds.length);
        expect(estimateResult.balances).to.have.lengthOf(expects.balances.length);

        // 3. user obtains a zap supply transaction request
        expect(zapDepositInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await zapDepositInfo.buildRouterTransactionRequest({
          permitData,
          permitSig,
        });
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's balance will increase.
        const destToken = params.destToken;
        const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
        const collateralBalance = await service.getCollateralBalance(marketId, user.address, destToken);
        const quoteDestAmount = new common.TokenAmount(destToken, zapDepositInfo.fields.destAmount);

        // 4-1. rate may change when the block of getting api data is different from the block of executing tx
        const [min, max] = utils.bpsBound(quoteDestAmount.amount);
        const maxDestAmount = quoteDestAmount.clone().set(max);
        const minDestAmount = quoteDestAmount.clone().set(min);

        expect(collateralBalance.lte(maxDestAmount)).to.be.true;
        expect(collateralBalance.gte(minDestAmount)).to.be.true;
      });
    }
  });
});
