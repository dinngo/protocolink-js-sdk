import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import { expect } from 'chai';
import { getBalance, snapshotAndRevertEach } from '@protocolink/test-helpers';
import hre from 'hardhat';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

describe('Transaction: Debt swap', function () {
  const chainId = 1;
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
  });

  snapshotAndRevertEach();

  context('Test Debt swap', function () {
    const testCases = [
      {
        skip: false,
        testingAccount: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV2.mainnetTokens.USDC,
          srcAmount: '1000',
          srcDebtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
          destToken: aaveV2.mainnetTokens.DAI,
          destDebtToken: '0x6C3c78838c761c6Ac7bE9F59fe808ea2A6E4379d', // variableDebtDAI
        },
        expects: {
          approveTimes: 1,
          logicLength: 5,
        },
      },
      // {
      //   // TODO: ERC20: transfer amount exceeds balance
      //   skip: false,
      //   testingAccount: '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e',
      //   protocolId: 'radiant-v2',
      //   marketId: 'mainnet',
      //   params: {
      //     srcToken: radiantV2.mainnetTokens.USDC,
      //     srcAmount: '1000',
      //     srcDebtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
      //     destToken: radiantV2.mainnetTokens.USDT,
      //     destDebtToken: '0x2D4fc0D5421C0d37d325180477ba6e16ae3aBAA7', // vdUSDT
      //   },
      //   expects: {
      //     approveTimes: 1,
      //     logicLength: 5,
      //   },
      // },
      {
        skip: false,
        testingAccount: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.USDC,
          srcAmount: '1000',
          srcDebtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
          destToken: aaveV3.mainnetTokens.DAI,
          destDebtToken: '0xcF8d0c70c850859266f5C338b38F9D663181C314', // variableDebtEthDAI
        },
        expects: {
          approveTimes: 1,
          logicLength: 5,
        },
      },
    ];

    for (const [i, { skip, testingAccount, protocolId, marketId, params, expects }] of testCases.entries()) {
      if (skip) continue;

      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);
        const srcInitBorrowBalance = await getBalance(user.address, params.srcDebtToken!);
        const destInitBorrowBalance = await getBalance(user.address, params.destDebtToken!);

        // 1. user obtains a quotation for debt swap
        const debtSwapInfo = await adapter.getDebtSwap(protocolId, marketId, params, user.address, portfolio);
        const estimateResult = debtSwapInfo.estimateResult;

        // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

        // 3. user obtains a debt swap transaction request
        expect(debtSwapInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await debtSwapInfo.buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's src token borrow balance should decrease.
        // 4-1. debt grows when the block of getting api data is different from the block of executing tx
        const repayAmount = debtSwapInfo.logics[2].fields.input.amount;
        expect(user.address).changeBalance(params.srcDebtToken, -repayAmount, slippage);

        // 5. user's dest token borrow balance should increase
        // // 5-1. debt grows when the block of getting api data is different from the block of executing tx
        const borrowAmount = debtSwapInfo.fields.destAmount!;
        expect(user.address).changeBalance(params.destDebtToken, borrowAmount, slippage);
      });
    }
  });
});
