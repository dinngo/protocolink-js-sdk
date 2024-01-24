import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import { expect } from 'chai';
import hre from 'hardhat';
import { mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';

describe('Transaction: Debt swap', function () {
  const chainId = 1;
  const permit2Type = 'approve';
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
  });

  snapshotAndRevertEach();

  context('Test Debt swap', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        srcToken: mainnetTokens.USDC,
        srcAmount: '1000',
        srcDebtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
        destToken: mainnetTokens.DAI,
        destDebtToken: '0x6C3c78838c761c6Ac7bE9F59fe808ea2A6E4379d', // variableDebtDAI
        expects: {
          logicLength: 5,
        },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e',
        srcToken: mainnetTokens.USDC,
        srcAmount: '1000',
        srcDebtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
        destToken: mainnetTokens.USDT,
        destDebtToken: '0x2D4fc0D5421C0d37d325180477ba6e16ae3aBAA7', // vdUSDT
        expects: {
          logicLength: 5,
        },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        srcToken: mainnetTokens.USDC,
        srcAmount: '1000',
        srcDebtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
        destToken: mainnetTokens.DAI,
        destDebtToken: '0xcF8d0c70c850859266f5C338b38F9D663181C314', // variableDebtEthDAI
        expects: {
          logicLength: 5,
        },
      },
    ];

    testCases.forEach(
      ({ protocolId, marketId, account, srcToken, srcAmount, srcDebtToken, destToken, destDebtToken, expects }, i) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          user = await hre.ethers.getImpersonatedSigner(account);
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

          // 1. user obtains a quotation for debt swap
          const debtSwapInfo = await adapter.debtSwap({
            account,
            portfolio,
            srcToken,
            srcAmount,
            destToken,
          });

          // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
          const estimateResult = await apisdk.estimateRouterData(
            { chainId, account, logics: debtSwapInfo.logics },
            { permit2Type }
          );
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }

          // 3. user obtains a debt swap transaction request
          expect(debtSwapInfo.logics.length).to.eq(expects.logicLength);
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics: debtSwapInfo.logics,
          });
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          // 4. user's src token borrow balance should decrease.
          // 4-1. debt grows when the block of getting api data is different from the block of executing tx
          const repayAmount = srcAmount;
          expect(user.address).changeBalance(srcDebtToken, -repayAmount, slippage);

          // 5. user's dest token borrow balance should increase
          // 5-1. debt grows when the block of getting api data is different from the block of executing tx
          const borrowAmount = debtSwapInfo.destAmount!;
          expect(user.address).changeBalance(destDebtToken, borrowAmount, slippage);
        });
      }
    );
  });
});
