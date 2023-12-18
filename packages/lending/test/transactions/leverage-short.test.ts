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

describe('Transaction: Leverage Short', function () {
  const chainId = 1;
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.USDC, '10000');
  });

  snapshotAndRevertEach();

  context('Test Leverage Short', function () {
    const testCases = [
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.WETH,
          srcAmount: '1',
          srcDebtToken: '0xeA51d7853EEFb32b6ee06b1C12E6dcCA88Be0fFE', // variableDebtEthWETH
          destToken: mainnetTokens.USDC,
          destAToken: aaveV3.mainnetTokens.aEthUSDC,
        },
        expects: {
          approveTimes: 1,
          logicLength: 6,
        },
      },
      // TODO: do we need to test other protocols?
    ];

    for (const [i, { protocolId, marketId, params, expects }] of testCases.entries()) {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const supplyAmount = new common.TokenAmount(params.destToken, '10000');
        const borrowAmount = new common.TokenAmount(params.srcToken, '1');

        const service = new logics.aavev3.Service(chainId, hre.ethers.provider);
        const lendingPoolAddress = await service.getPoolAddress();
        // 1. user has supplied dest token
        await utils.supplyAaveV3(user, lendingPoolAddress, supplyAmount);

        // 2. user has borrowed src token
        await utils.borrowAaveV3(user, lendingPoolAddress, borrowAmount);

        // 3. user obtains a quotation for leveraging short src token
        const leverageShortInfo = await adapter.getLeverageShort(protocolId, marketId, params, user.address, portfolio);
        const estimateResult = leverageShortInfo.estimateResult;
        const leverageAmount = new common.TokenAmount(leverageShortInfo.logics[1].fields.output);

        // 4. user needs to permit the Protocolink user agent to borrow for the user
        expect(estimateResult.approvals.length).to.eq(expects.approveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        // TODO: move to unit test
        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

        // 5. user obtains a leverage short transaction request
        const transactionRequest = await leverageShortInfo.buildRouterTransactionRequest();
        expect(leverageShortInfo.logics.length).to.eq(expects.logicLength);
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 6. user's supply balance will increase.
        // 6-1. due to the slippage caused by the swap, we need to calculate the minimum leverage amount.
        const supplyBalance = await getBalance(user.address, params.destAToken);
        const minimumLeverageAmount = new common.TokenAmount(leverageAmount.token).setWei(
          common.calcSlippage(leverageAmount.amountWei, slippage)
        );
        expect(supplyBalance.gte(supplyAmount.clone().add(minimumLeverageAmount))).to.be.true;

        // 7. user's borrow balance will increase.
        // 7-1. As the block number increases, the initial borrow balance will also increase.
        const borrowBalance = await getBalance(user.address, params.srcDebtToken);
        const leverageBorrowAmount = new common.TokenAmount(leverageShortInfo.logics[4].fields.output);
        expect(borrowBalance.gte(borrowAmount.clone().add(leverageBorrowAmount))).to.be.true;
      });
    }
  });
});
