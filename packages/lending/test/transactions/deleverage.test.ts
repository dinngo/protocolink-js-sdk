import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import { claimToken, getBalance, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import * as utils from 'test/utils';

describe('Transaction: Deleverage', function () {
  const chainId = 1;
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, aaveV3.mainnetTokens.WETH, '10');
  });

  snapshotAndRevertEach();

  context('Test Deleverage', function () {
    const testCases = [
      {
        skip: false,
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV2.mainnetTokens.USDC,
          srcAmount: '100',
          srcDebtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
          destToken: aaveV2.mainnetTokens.WETH,
          destAToken: aaveV2.mainnetTokens.aWETH,
        },
        expects: {
          approveTimes: 2,
          logicLength: 6,
        },
      },
      {
        skip: false,
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        params: {
          srcToken: radiantV2.mainnetTokens.USDC,
          srcAmount: '100',
          srcDebtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
          destToken: radiantV2.mainnetTokens.WETH,
          destAToken: radiantV2.mainnetTokens.rWETH,
        },
        expects: {
          approveTimes: 2,
          logicLength: 6,
        },
      },
      {
        skip: false,
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.USDC,
          srcAmount: '100',
          srcDebtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
          destToken: aaveV3.mainnetTokens.WETH,
          destAToken: aaveV3.mainnetTokens.aEthWETH,
        },
        expects: {
          approveTimes: 2,
          logicLength: 6,
        },
      },
      {
        skip: false,
        protocolId: 'compound-v3',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.USDC,
          srcAmount: '100',
          destToken: compoundV3.mainnetTokens.WETH,
        },
        expects: {
          approveTimes: 1,
          logicLength: 5,
        },
      },
    ];

    for (const [i, { skip, protocolId, marketId, params, expects }] of testCases.entries()) {
      if (skip) continue;

      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const supplyAmount = new common.TokenAmount(params.destToken, '5');
        const borrowAmount = new common.TokenAmount(params.srcToken, params.srcAmount);

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

        // 3. user obtains a quotation for deleveraging dest token
        const deleverageInfo = await adapter.getDeleverage(protocolId, marketId, params, user.address, portfolio);
        const estimateResult = deleverageInfo.estimateResult;

        // 4. user needs to permit the Protocolink user agent to borrow on behalf of the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

        // 5. user obtains a deleverage transaction request
        let transactionRequest;
        expect(deleverageInfo.logics.length).to.eq(expects.logicLength);
        if (protocolId !== 'compound-v3') {
          const permitData = estimateResult.permitData;
          expect(permitData).to.not.be.undefined;
          const { domain, types, values } = permitData!;
          const permitSig = await user._signTypedData(domain, types, values);

          transactionRequest = await deleverageInfo.buildRouterTransactionRequest({
            permitData,
            permitSig,
          });
        } else {
          transactionRequest = await deleverageInfo.buildRouterTransactionRequest();
          expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        }
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        let collateralBalance, deleverageWithdrawAmount, borrowBalance;
        if (protocolId === 'compound-v3') {
          service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
          collateralBalance = await service.getCollateralBalance(marketId, user.address, params.destToken);
          deleverageWithdrawAmount = new common.TokenAmount(deleverageInfo.logics[3].fields.output);
          borrowBalance = await service.getBorrowBalance(marketId, user.address);
        } else {
          collateralBalance = await getBalance(user.address, params.destAToken!);
          deleverageWithdrawAmount = new common.TokenAmount(deleverageInfo.logics[4].fields.output);
          borrowBalance = await getBalance(user.address, params.srcDebtToken!);
        }

        // 6. user's collateral balance should decrease.
        // 6-1. collateral grows when the block of getting api data is different from the block of executing tx
        expect(collateralBalance.gte(supplyAmount.clone().sub(deleverageWithdrawAmount))).to.be.true;

        // 7. user's borrow balance should decrease.
        await expect(user.address).to.changeBalance(borrowBalance.token, -params.srcAmount, slippage);
      });
    }
  });
});
