import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import { claimToken, getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
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
    await claimToken(chainId, user.address, mainnetTokens.USDT, '5000');
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
        zapAmount: '100',
        collateralToken: mainnetTokens.WETH,
        debtToken: mainnetTokens.USDC,
        leverageDebtAmount: '1000',
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        hasCollateral: false,
        zapToken: mainnetTokens.USDT,
        zapAmount: '5000',
        collateralToken: mainnetTokens.WETH,
        debtToken: mainnetTokens.USDC,
        leverageDebtAmount: '1000',
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        hasCollateral: true,
        zapToken: mainnetTokens.USDT,
        zapAmount: '100',
        collateralToken: mainnetTokens.WETH,
        debtToken: mainnetTokens.USDC,
        leverageDebtAmount: '1000',
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        hasCollateral: false,
        zapToken: mainnetTokens.USDT,
        zapAmount: '5000',
        collateralToken: mainnetTokens.WETH,
        debtToken: mainnetTokens.DAI,
        leverageDebtAmount: '1000',
        expects: { logicLength: 7 },
      },
    ];

    testCases.forEach(
      (
        {
          protocolId,
          marketId,
          hasCollateral,
          zapToken,
          zapAmount,
          collateralToken,
          debtToken,
          leverageDebtAmount,
          expects,
        },
        i
      ) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          // 0. prep user positions
          const account = user.address;
          const initBorrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, debtToken);
          const initCollateralBalance = new common.TokenAmount(collateralToken, initSupplyAmount);
          if (hasCollateral) {
            await utils.deposit(chainId, protocolId, marketId, user, initCollateralBalance);
          }

          // 1. user obtains a quotation for open by debt
          const expectedBorrowBalance = initBorrowBalance!.add(leverageDebtAmount);
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
          const openDebtInfo = await adapter.openByDebt(
            account,
            portfolio,
            zapToken,
            zapAmount,
            collateralToken,
            debtToken,
            expectedBorrowBalance.amount,
            slippage
          );
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
          const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, debtToken);
          const [, maxExpectedBorrowBalance] = utils.bpsBound(expectedBorrowBalance.amount);
          expect(borrowBalance!.gte(expectedBorrowBalance));
          expect(borrowBalance!.lte(maxExpectedBorrowBalance));
        });
      }
    );
  });
});
