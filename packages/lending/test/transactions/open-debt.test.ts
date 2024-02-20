import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('Transaction: Open By Debt', function () {
  const chainId = 1;
  const slippage = 1000;
  const initSupplyAmount = '5';

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.USDT, '2000');
    await claimToken(chainId, user.address, mainnetTokens.WETH, initSupplyAmount);
  });

  snapshotAndRevertEach();

  context('Test Open By Debt', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        hasCollateral: true,
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        debtToken: mainnetTokens.USDC,
        debtAmount: '100',
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        hasCollateral: false,
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        debtToken: mainnetTokens.USDC,
        debtAmount: '100',
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        hasCollateral: true,
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        debtToken: mainnetTokens.USDC,
        debtAmount: '100',
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        hasCollateral: false,
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        debtToken: mainnetTokens.DAI,
        debtAmount: '100',
        expects: { logicLength: 7 },
      },
    ];

    testCases.forEach(
      (
        { protocolId, marketId, hasCollateral, zapToken, zapAmount, collateralToken, debtToken, debtAmount, expects },
        i
      ) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          // 0. prep user positions
          const account = user.address;
          const initCollateralBalance = new common.TokenAmount(collateralToken, '0');
          if (hasCollateral) {
            initCollateralBalance.set(initSupplyAmount);
            await utils.deposit(chainId, protocolId, marketId, user, initCollateralBalance);
          }

          // 1. user obtains a quotation for open by debt
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
          const openDebtInfo = await adapter.openByDebt({
            account,
            portfolio,
            zapToken,
            zapAmount,
            collateralToken,
            debtToken,
            debtAmount,
            slippage,
          });
          const logics = openDebtInfo.logics;
          expect(openDebtInfo.error).to.be.undefined;
          expect(logics.length).to.eq(expects.logicLength);

          // 2. user needs to permit the Protocolink user agent to borrow for the user
          const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }
          // 2-1. user sign permit data
          const permitData = estimateResult.permitData;
          expect(permitData).to.not.be.undefined;
          const { domain, types, values } = permitData!;
          const permitSig = await user._signTypedData(domain, types, values);

          // 3. user obtains a leverage by debt transaction request
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics,
            permitData,
            permitSig,
          });
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          // 4. user's borrow balance should be around debtAmount.
          const expectedBorrowBalance = new common.TokenAmount(debtToken, debtAmount);
          const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, debtToken);
          const minExpectBorrowBalance = common.calcSlippage(expectedBorrowBalance.amountWei, 1);
          // 4-1. init borrow balance is 0
          expect(borrowBalance!.amountWei).to.be.gte(minExpectBorrowBalance);
        });
      }
    );
  });
});
