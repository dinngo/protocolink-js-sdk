import { Adapter } from 'src/adapter';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as morphoblue from 'src/protocols/morphoblue/tokens';
import * as utils from 'test/utils';

describe('Transaction: Leverage By Collateral', function () {
  const chainId = 1;
  const initSupplyAmount = '5';
  const slippage = 1000;

  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, initSupplyAmount);
    await claimToken(chainId, user.address, logics.morphoblue.mainnetTokens.wstETH, initSupplyAmount);
  });

  snapshotAndRevertEach();

  context('Test Leverage By Collateral', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        destToken: mainnetTokens.DAI,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 5 },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        srcToken: morphoblue.mainnetTokens.wstETH,
        srcAmount: '1',
        destToken: mainnetTokens.USDC,
        expects: { logicLength: 5 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        // 0. prep user positions
        const account = user.address;
        const initSupplyBalance = new common.TokenAmount(srcToken, initSupplyAmount);
        await utils.deposit(chainId, protocolId, marketId, user, initSupplyBalance);

        // 1. user obtains a quotation for leveraging src token
        const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const leverageCollateralInfo = await adapter.leverageByCollateral({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
          slippage,
        });
        const logics = leverageCollateralInfo.logics;
        expect(leverageCollateralInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);
        const leverageAmount = new common.TokenAmount(logics[1].fields.output);

        // 2. user needs to permit the Protocolink user agent to borrow for the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        // 3. user obtains a leverage collateral transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's supply balance will increase.
        // 4-1. due to the slippage caused by the swap, we need to calculate the minimum leverage amount.
        const protocol = adapter.getProtocol(protocolId);
        const supplyBalance = await utils.getCollateralBalance(chainId, protocol, marketId, user, srcToken);
        const minimumLeverageAmount = new common.TokenAmount(leverageAmount.token).setWei(
          common.calcSlippage(leverageAmount.amountWei, slippage)
        );
        expect(supplyBalance!.gte(initSupplyBalance.clone().add(minimumLeverageAmount.amount))).to.be.true;

        // 5. user's borrow balance will increase.
        // 5-1. As the block number increases, the initial borrow balance will also increase.
        const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, destToken);
        const leverageBorrowAmount = borrowBalance!.clone().set(leverageCollateralInfo.destAmount);
        utils.expectEqWithinBps(borrowBalance!.amountWei, leverageBorrowAmount.amountWei);
      });
    });
  });
});
