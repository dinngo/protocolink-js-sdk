import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import { claimToken, getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Leverage Long', function () {
  const chainId = 1;
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, mainnetTokens.WETH, '10');
  });

  snapshotAndRevertEach();

  context('Test Leverage Long', function () {
    const testCases = [
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.WETH,
          srcAmount: '1',
          aToken: aaveV3.mainnetTokens.aEthWETH,
          destToken: mainnetTokens.USDC,
          debtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
        },
        expects: {
          approveTimes: 1,
          logicLength: 6,
        },
      },
      {
        protocolId: 'compound-v3',
        marketId: 'USDC',
        params: {
          srcToken: mainnetTokens.WETH,
          srcAmount: '1',
          destToken: mainnetTokens.USDC,
        },
        expects: {
          approveTimes: 1,
          logicLength: 5,
        },
      },
    ];

    for (const [i, { protocolId, marketId, params, expects }] of testCases.entries()) {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const supplyAmount = new common.TokenAmount(params.srcToken, '5');
        const borrowAmount = new common.TokenAmount(params.destToken, '2000');

        // 1. user has supplied src token and borrowed dest token
        if (protocolId === 'compound-v3') {
          await utils.supply(chainId, user, marketId, supplyAmount);
          await utils.borrow(chainId, user, marketId, borrowAmount);
        } else {
          const service = new logics.aavev3.Service(chainId, hre.ethers.provider);
          const lendingPoolAddress = await service.getPoolAddress();
          await utils.supplyAaveV3(user, lendingPoolAddress, supplyAmount);
          await utils.borrowAaveV3(user, lendingPoolAddress, borrowAmount);
        }

        // 2. user obtains a quotation for leveraging src token
        const leverageAmount = new common.TokenAmount(params.srcToken, params.srcAmount);
        const leverageLongInfo = await adapter.getLeverageLong(protocolId, marketId, params, user.address, portfolio);
        const estimateResult = leverageLongInfo.estimateResult;

        // 3. user needs to permit the Protocolink user agent to borrow for the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

        // 4. user obtains a leverage long transaction request
        expect(leverageLongInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await leverageLongInfo.buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 5. user's supply balance will increase.
        // 5-1. due to the slippage caused by the swap, we need to calculate the minimum leverage amount.
        let supplyBalance;
        if (protocolId === 'compound-v3') {
          const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
          supplyBalance = await service.getCollateralBalance(marketId, user.address, leverageAmount.token);
        } else {
          supplyBalance = await getBalance(user.address, params.aToken!);
        }
        const minimumLeverageAmount = new common.TokenAmount(leverageAmount.token).setWei(
          common.calcSlippage(leverageAmount.amountWei, slippage)
        );
        expect(supplyBalance.gte(supplyAmount.clone().add(minimumLeverageAmount))).to.be.true;

        // 6. user's borrow balance will increase.
        // 6-1. As the block number increases, the initial borrow balance will also increase.
        let borrowBalance, leverageBorrowAmount;
        if (protocolId === 'compound-v3') {
          const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
          borrowBalance = await service.getBorrowBalance(marketId, user.address);
          leverageBorrowAmount = new common.TokenAmount(leverageLongInfo.logics[3].fields.output);
        } else {
          borrowBalance = await getBalance(user.address, params.debtToken!);
          leverageBorrowAmount = new common.TokenAmount(leverageLongInfo.logics[4].fields.output);
        }
        expect(borrowBalance.gte(borrowAmount.clone().add(leverageBorrowAmount))).to.be.true;
      });
    }
  });
});
