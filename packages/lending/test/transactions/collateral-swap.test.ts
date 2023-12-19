import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import { claimToken, getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import * as utils from 'test/utils';

describe('Transaction: Collateral swap', function () {
  const chainId = 1;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, mainnetTokens.WETH, '5');
  });

  snapshotAndRevertEach();

  context('Test Collateral swap', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.WETH,
          srcAmount: '1',
          srcAToken: aaveV2.mainnetTokens.aWETH,
          destToken: mainnetTokens.WBTC,
          destAToken: aaveV2.mainnetTokens.aWBTC,
        },
        expects: {
          approveTimes: 1,
          logicLength: 7,
        },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.WETH,
          srcAmount: '1',
          srcAToken: radiantV2.mainnetTokens.rWETH,
          destToken: mainnetTokens.WBTC,
          destAToken: radiantV2.mainnetTokens.rWBTC,
        },
        expects: {
          approveTimes: 1,
          logicLength: 7,
        },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.WETH,
          srcAmount: '1',
          srcAToken: aaveV3.mainnetTokens.aEthWETH,
          destToken: mainnetTokens.WBTC,
          destAToken: aaveV3.mainnetTokens.aEthWBTC,
        },
        expects: {
          approveTimes: 1,
          logicLength: 7,
        },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        params: {
          srcToken: mainnetTokens.WETH,
          srcAmount: '1',
          destToken: mainnetTokens.WBTC,
        },
        expects: {
          approveTimes: 1,
          logicLength: 5,
        },
      },
    ];

    for (const [i, { protocolId, marketId, params, expects }] of testCases.entries()) {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const supplyAmount = new common.TokenAmount(params.srcToken, '5');
        const borrowAmount = new common.TokenAmount(mainnetTokens.USDC, '2000');

        // 1. user supply and borrow token
        let service, lendingPoolAddress;
        switch (protocolId) {
          case 'aave-v2':
            service = new logics.aavev2.Service(chainId, hre.ethers.provider);
            lendingPoolAddress = await service.getLendingPoolAddress();
            await utils.depositAaveV2(user, lendingPoolAddress, supplyAmount);
            await utils.borrowAaveV2(user, lendingPoolAddress, borrowAmount);
            break;
          case 'radiant-v2':
            service = new logics.radiantv2.Service(chainId, hre.ethers.provider);
            lendingPoolAddress = await service.getLendingPoolAddress();
            await utils.depositRadiantV2(user, lendingPoolAddress, supplyAmount);
            await utils.borrowRadiantV2(user, lendingPoolAddress, borrowAmount);
            break;
          case 'aave-v3':
            service = new logics.aavev3.Service(chainId, hre.ethers.provider);
            lendingPoolAddress = await service.getPoolAddress();
            await utils.supplyAaveV3(user, lendingPoolAddress, supplyAmount);
            await utils.borrowAaveV3(user, lendingPoolAddress, borrowAmount);
            break;
          case 'compound-v3':
            service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
            await utils.supply(chainId, user, marketId, supplyAmount);
            await utils.borrow(chainId, user, marketId, borrowAmount);
            break;
          default:
            expect(protocolId).to.eq('unsupported'); // throw error
        }

        // 3. user obtains a quotation for collateral swap srcToken to destToken
        const collateralSwapInfo = await adapter.collateralSwap(protocolId, marketId, params, user.address, portfolio);
        const estimateResult = collateralSwapInfo.estimateResult;

        // 4. user needs to allow the Protocolink user agent to borrow on behalf of the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

        // 5. user obtains a collateral swap transaction request
        let transactionRequest;
        if (protocolId !== 'compound-v3') {
          const permitData = estimateResult.permitData;
          expect(permitData).to.not.be.undefined;
          const { domain, types, values } = permitData!;
          const permitSig = await user._signTypedData(domain, types, values);

          transactionRequest = await collateralSwapInfo.buildRouterTransactionRequest({
            permitData,
            permitSig,
          });
        } else {
          transactionRequest = await collateralSwapInfo.buildRouterTransactionRequest();
        }
        expect(collateralSwapInfo.logics.length).to.eq(expects.logicLength);
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        let collateralBalance, destBalance, quoteDestAmount;
        if (protocolId === 'compound-v3') {
          service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
          collateralBalance = await service.getCollateralBalance(marketId, user.address, params.srcToken);
          destBalance = await service.getCollateralBalance(marketId, user.address, params.destToken);
          quoteDestAmount = new common.TokenAmount(params.destToken, collateralSwapInfo.fields.destAmount);
        } else {
          collateralBalance = await getBalance(user.address, params.srcAToken!);
          destBalance = await getBalance(user.address, params.destAToken!);
          quoteDestAmount = new common.TokenAmount(params.destToken, collateralSwapInfo.fields.destAmount);
        }

        // 6. user's src token balance will decrease.
        expect(collateralBalance.gte(supplyAmount.clone().sub(params.srcAmount))).to.be.true;

        // 7. user's dest token balance will increase.
        // 7-1. rate may change when the block of getting api data is different from the block of executing tx
        const [min, max] = utils.bpsBound(quoteDestAmount.amount);
        const maxDestAmount = quoteDestAmount.clone().set(max);
        const minDestAmount = quoteDestAmount.clone().set(min);
        expect(destBalance.lte(maxDestAmount)).to.be.true;
        expect(destBalance.gte(minDestAmount)).to.be.true;
      });
    }
  });
});
