import { Adapter } from 'src/adapter';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as apisdk from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import { spark } from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Leverage Short', function () {
  const chainId = 1;
  const initSupplyAmount = '5';
  const slippage = 100;

  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, initSupplyAmount);
  });

  snapshotAndRevertEach();

  context('Test Leverage Short', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        srcAccountingToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
        destToken: mainnetTokens.WETH,
        destAccountingToken: aaveV2.mainnetTokens.aWETH,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        srcAccountingToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
        destToken: mainnetTokens.WETH,
        destAccountingToken: radiantV2.mainnetTokens.rWETH,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        srcAccountingToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
        destToken: mainnetTokens.WETH,
        destAccountingToken: aaveV3.mainnetTokens.aEthWETH,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        srcToken: mainnetTokens.DAI,
        srcAmount: '100',
        srcAccountingToken: '0xf705d2B7e92B3F38e6ae7afaDAA2fEE110fE5914', // DAI_variableDebtToken
        destToken: mainnetTokens.WETH,
        destAccountingToken: spark.mainnetTokens.spWETH,
        expects: { logicLength: 6 },
      },
    ];

    testCases.forEach(
      (
        { protocolId, marketId, srcToken, srcAmount, srcAccountingToken, destToken, destAccountingToken, expects },
        i
      ) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          // 0. prep user positions
          const account = user.address;
          const initSupplyBalance = new common.TokenAmount(destToken, initSupplyAmount);
          await utils.deposit(chainId, protocolId, marketId, user, initSupplyBalance);

          // 1. user obtains a quotation for leveraging short src token
          const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
          const leverageShortInfo = await adapter.leverageShort({
            account,
            portfolio,
            srcToken,
            srcAmount,
            destToken,
          });
          const logics = leverageShortInfo.logics;
          expect(leverageShortInfo.error).to.be.undefined;
          expect(logics.length).to.eq(expects.logicLength);
          const leverageAmount = new common.TokenAmount(logics[1].fields.output);

          // 2. user needs to permit the Protocolink user agent to borrow for the user
          const estimateResult = await apisdk.estimateRouterData({
            chainId,
            account,
            logics,
          });
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }

          // 3. user obtains a leverage short transaction request
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics,
          });
          expect(leverageShortInfo.logics.length).to.eq(expects.logicLength);
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          // 4. user's supply balance will increase.
          // 4-1. due to the slippage caused by the swap, we need to calculate the minimum leverage amount.
          const supplyBalance = await utils.getCollateralBalance(
            chainId,
            protocolId,
            marketId,
            user,
            destAccountingToken
          );
          const minimumLeverageAmount = new common.TokenAmount(leverageAmount.token).setWei(
            common.calcSlippage(leverageAmount.amountWei, slippage)
          );
          expect(supplyBalance?.gte(initSupplyBalance.clone().add(minimumLeverageAmount.amount))).to.be.true;

          // // 5. user's borrow balance will increase.
          // // 5-1. As the block number increases, the initial borrow balance will also increase.
          const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, srcAccountingToken);
          const leverageBorrowAmount = new common.TokenAmount(leverageShortInfo.logics[4].fields.output);
          expect(borrowBalance?.gte(leverageBorrowAmount.amount)).to.be.true;
        });
      }
    );
  });
});
