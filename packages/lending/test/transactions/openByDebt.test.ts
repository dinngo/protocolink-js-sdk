import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import { claimToken, getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('Transaction: Open By Debt', function () {
  const chainId = 1;
  const permit2Type = 'approve';

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    await claimToken(chainId, '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E', mainnetTokens.USDT, '200');
    await claimToken(chainId, '0x0E79368B079910b31e71Ce1B2AE510461359128D', mainnetTokens.USDT, '200');
    await claimToken(chainId, '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550', mainnetTokens.USDT, '200');
    await claimToken(chainId, '0xee2826453a4fd5afeb7ceffeef3ffa2320081268', mainnetTokens.USDT, '200');
  });

  snapshotAndRevertEach();

  context('Test Open By Debt', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        zapToken: mainnetTokens.USDT,
        zapAmount: '100',
        collateralToken: mainnetTokens.WETH,
        debtToken: mainnetTokens.USDC,
        debtAmountDelta: '1000',
        debtDebtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0x0E79368B079910b31e71Ce1B2AE510461359128D',
        zapToken: mainnetTokens.USDT,
        zapAmount: '100',
        collateralToken: mainnetTokens.USDC,
        debtToken: mainnetTokens.WETH,
        debtAmountDelta: '0.1',
        debtDebtToken: '0xDf1E9234d4F10eF9FED26A7Ae0EF43e5e03bfc31', // vdWETH
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        zapToken: mainnetTokens.USDT,
        zapAmount: '100',
        collateralToken: mainnetTokens.WBTC,
        debtToken: mainnetTokens.USDC,
        debtAmountDelta: '1000',
        debtDebtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        account: '0xee2826453a4fd5afeb7ceffeef3ffa2320081268',
        zapToken: mainnetTokens.USDT,
        zapAmount: '100',
        collateralToken: mainnetTokens.USDC,
        debtToken: mainnetTokens.WETH,
        debtAmountDelta: '0.1',
        debtDebtToken: '0x2e7576042566f8D6990e07A1B61Ad1efd86Ae70d', // WETH_variableDebtToken
        expects: { logicLength: 7 },
      },
    ];

    testCases.forEach(
      (
        {
          protocolId,
          marketId,
          account,
          zapToken,
          zapAmount,
          collateralToken,
          debtToken,
          debtAmountDelta,
          debtDebtToken,
          expects,
        },
        i
      ) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          user = await hre.ethers.getImpersonatedSigner(account);
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

          const initBorrowBalance = await getBalance(user.address, debtDebtToken);
          const expectedBorrowBalance = initBorrowBalance.add(debtAmountDelta);
          const debtAmount = expectedBorrowBalance.amount;

          // 1. user obtains a quotation for open by debt
          const openDebtInfo = await adapter.openByDebt(
            account,
            portfolio,
            zapToken,
            zapAmount,
            collateralToken,
            debtToken,
            debtAmount
          );

          expect(openDebtInfo.error).to.be.undefined;
          const logics = openDebtInfo.logics;

          // 2. user needs to permit the Protocolink user agent to borrow for the user
          const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics }, { permit2Type });
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }

          // 3. user obtains a leverage by debt transaction request
          expect(openDebtInfo.logics.length).to.eq(expects.logicLength);
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics,
          });
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          // 4. user's borrow balance should be around debtAmount.
          const borrowBalance = await getBalance(user.address, debtDebtToken);
          const [, max] = utils.bpsBound(debtAmount);
          const maxExpectedBorrowBalance = expectedBorrowBalance.clone().set(max);
          expect(borrowBalance.gte(expectedBorrowBalance));
          expect(borrowBalance.lte(maxExpectedBorrowBalance));
        });
      }
    );
  });
});
