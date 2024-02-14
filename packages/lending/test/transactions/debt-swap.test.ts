import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as spark from 'src/protocols/spark/tokens';
import * as utils from 'test/utils';

describe('Transaction: Debt swap', function () {
  const chainId = 1;
  const initSupplyAmount = '2';
  const initBorrowAmount = '200';
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, mainnetTokens.WETH, initSupplyAmount);
  });

  snapshotAndRevertEach();

  context('Test Debt swap', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        srcDebtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
        destToken: mainnetTokens.DAI,
        destDebtToken: '0x6C3c78838c761c6Ac7bE9F59fe808ea2A6E4379d', // variableDebtDAI
        expects: { logicLength: 5 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        srcDebtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
        destToken: mainnetTokens.USDT,
        destDebtToken: '0x2D4fc0D5421C0d37d325180477ba6e16ae3aBAA7', // vdUSDT
        expects: { logicLength: 5 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        srcDebtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
        destToken: mainnetTokens.DAI,
        destDebtToken: '0xcF8d0c70c850859266f5C338b38F9D663181C314', // variableDebtEthDAI
        expects: { logicLength: 5 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.DAI,
        srcAmount: '100',
        srcDebtToken: '0xf705d2B7e92B3F38e6ae7afaDAA2fEE110fE5914', // DAI_variableDebtToken
        destToken: spark.mainnetTokens.wstETH,
        destDebtToken: '0xd5c3E3B566a42A6110513Ac7670C1a86D76E13E6', // wstETH_variableDebtToken
        expects: { logicLength: 5 },
      },
    ];

    testCases.forEach(
      (
        { protocolId, marketId, supplyToken, srcToken, srcAmount, srcDebtToken, destToken, destDebtToken, expects },
        i
      ) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          // 0. prep user positions
          const account = user.address;
          await utils.deposit(
            chainId,
            protocolId,
            marketId,
            user,
            new common.TokenAmount(supplyToken, initSupplyAmount)
          );
          await utils.borrow(chainId, protocolId, marketId, user, new common.TokenAmount(srcToken, initBorrowAmount));

          // 1. user obtains a quotation for debt swap
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
          const debtSwapInfo = await adapter.debtSwap({
            account,
            portfolio,
            srcToken,
            srcAmount,
            destToken,
          });
          const logics = debtSwapInfo.logics;
          expect(debtSwapInfo.error).to.be.undefined;
          expect(logics.length).to.eq(expects.logicLength);

          // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
          const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }

          // 3. user obtains a debt swap transaction request
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics,
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
