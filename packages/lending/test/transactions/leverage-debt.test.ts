import { Adapter } from 'src/adapter';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('Transaction: Leverage By Debt', function () {
  const chainId = 1;
  const initSupplyAmount = '5';
  const slippage = 1000;

  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, initSupplyAmount);
  });

  snapshotAndRevertEach();

  context('Test Leverage By Debt', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        srcToken: mainnetTokens.DAI,
        srcAmount: '100',
        destToken: mainnetTokens.WETH,
        expects: { logicLength: 6 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        // 0. prep user positions
        const account = user.address;
        const initSupplyBalance = new common.TokenAmount(destToken, initSupplyAmount);
        await utils.deposit(chainId, protocolId, marketId, user, initSupplyBalance);

        // 1. user obtains a quotation for leveraging src token
        const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const leverageDebtInfo = await adapter.leverageByDebt({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
          slippage,
        });
        const logics = leverageDebtInfo.logics;
        expect(leverageDebtInfo.error).to.be.undefined;
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

        // 3. user obtains a leverage debt transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics,
        });
        expect(leverageDebtInfo.logics.length).to.eq(expects.logicLength);
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's supply balance will increase.
        // 4-1. due to the slippage caused by the swap, we need to calculate the minimum leverage amount.
        const protocol = adapter.getProtocol(protocolId);
        const supplyBalance = await utils.getCollateralBalance(chainId, protocol, marketId, user, destToken);
        const minimumLeverageAmount = new common.TokenAmount(leverageAmount.token).setWei(
          common.calcSlippage(leverageAmount.amountWei, slippage)
        );
        expect(supplyBalance!.gte(initSupplyBalance.clone().add(minimumLeverageAmount.amount))).to.be.true;

        // 5. user's borrow balance will increase.
        // 5-1. As the block number increases, the initial borrow balance will also increase.
        const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, srcToken);
        const leverageBorrowAmount = new common.TokenAmount(leverageDebtInfo.logics[4].fields.output);
        const minLeverageBorrowBalance = common.calcSlippage(leverageBorrowAmount.amountWei, 1);
        expect(borrowBalance!.amountWei).to.be.gte(minLeverageBorrowBalance);
      });
    });
  });
});
