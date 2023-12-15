import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import { claimToken, getBalance, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
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

    await claimToken(chainId, user.address, aaveV3.mainnetTokens.WETH, '5');
  });

  snapshotAndRevertEach();

  context('Test Leverage Long', function () {
    const testCases = [
      {
        // TODO: AssertionError: Expected transaction NOT to be reverted, but it reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)
        skip: true,
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.WETH,
          srcAmount: '5',
          aToken: aaveV3.mainnetTokens.aEthWETH,
          destToken: aaveV3.mainnetTokens.USDC,
          debtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
        },
        expects: {
          approveTimes: 1,
          logicLength: 7,
        },
      },
      // {
      // TODO: AxiosError: Request failed with status code 400
      //   skip: false,
      //   protocolId: 'compound-v3',
      //   marketId: 'USDC',
      //   params: {
      //     srcToken: compoundV3.mainnetTokens.WETH,
      //     srcAmount: '5',
      //     destToken: compoundV3.mainnetTokens.USDC,
      //   },
      //   expects: {
      //     approveTimes: 1,
      //     logicLength: 7,
      //   },
      // },
    ];

    for (const [i, { skip, protocolId, marketId, params, expects }] of testCases.entries()) {
      if (skip) continue;

      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const supplyAmount = new common.TokenAmount(params.srcToken, '5');
        const borrowAmount = new common.TokenAmount(params.destToken, '2000');

        if (protocolId === 'compound-v3') {
          // 1. user has supplied src token
          console.log('1');
          await utils.supply(chainId, user, marketId, supplyAmount);

          // 2. user has borrowed dest token
          await utils.borrow(chainId, user, marketId, borrowAmount);
        } else {
          const service = new logics.aavev3.Service(chainId, hre.ethers.provider);
          const lendingPoolAddress = await service.getPoolAddress();
          // 1. user has supplied src token
          await utils.supplyAaveV3(user, lendingPoolAddress, supplyAmount);

          // 2. user has borrowed dest token
          await utils.borrowAaveV3(user, lendingPoolAddress, borrowAmount);
        }

        // 3. user obtains a quotation for leveraging src token
        const leverageAmount = new common.TokenAmount(params.srcToken, params.srcAmount);
        const leverageLongInfo = await adapter.getLeverageLong(protocolId, marketId, params, user.address, portfolio);
        const estimateResult = leverageLongInfo.estimateResult;

        // 4. user needs to permit the Protocolink user agent to borrow for the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

        // 5. user obtains a leverage long transaction request
        expect(leverageLongInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await leverageLongInfo.buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 6. user's supply balance will increase.
        // 6-1. due to the slippage caused by the swap, we need to calculate the minimum leverage amount.
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

        // 7. user's borrow balance will increase.
        // 7-1. As the block number increases, the initial borrow balance will also increase.
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
