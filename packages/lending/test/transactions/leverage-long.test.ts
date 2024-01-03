import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as apisdk from '@protocolink/api';
import { claimToken, getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

describe('Transaction: Leverage Long', function () {
  const chainId = 1;
  const permit2Type = 'approve';
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    await claimToken(chainId, '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E', mainnetTokens.USDC, '1000');
    await claimToken(chainId, '0xA38D6E3Aa9f3E4F81D4cEf9B8bCdC58aB37d066A', mainnetTokens.USDC, '1000');
    await claimToken(chainId, '0x06e4cb4f3ba9a2916b6384acbdeaa74daaf91550', mainnetTokens.USDC, '1000');
    await claimToken(chainId, '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111', mainnetTokens.USDC, '1000');
  });

  snapshotAndRevertEach();

  context('Test Leverage Long', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcAToken: aaveV2.mainnetTokens.aWETH,
        destToken: mainnetTokens.USDC,
        destDebtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
        expects: {
          approvalLength: 1,
          logicLength: 6,
        },
      },
      {
        // TODO: ERC20: transfer amount exceeds balance (sometimes)
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0xA38D6E3Aa9f3E4F81D4cEf9B8bCdC58aB37d066A',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcAToken: radiantV2.mainnetTokens.rWETH,
        destToken: mainnetTokens.USDC,
        destDebtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
        expects: {
          approvalLength: 1,
          logicLength: 6,
        },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcAToken: aaveV3.mainnetTokens.aEthWETH,
        destToken: mainnetTokens.USDC,
        destDebtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
        expects: {
          approvalLength: 1,
          logicLength: 6,
        },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        destToken: mainnetTokens.USDC,
        expects: {
          approvalLength: 1,
          logicLength: 5,
        },
      },
    ];

    testCases.forEach(
      ({ protocolId, marketId, account, srcToken, srcAmount, srcAToken, destToken, destDebtToken, expects }, i) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          user = await hre.ethers.getImpersonatedSigner(account);
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
          const leverageAmount = new common.TokenAmount(srcToken, srcAmount);

          // 1. get user positions
          let initSupplyBalance, initBorrowBalance;
          if (protocolId === 'compound-v3') {
            const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
            initSupplyBalance = await service.getCollateralBalance(marketId, user.address, leverageAmount.token);
            initBorrowBalance = await service.getBorrowBalance(marketId, user.address);
          } else {
            initSupplyBalance = await getBalance(user.address, srcAToken!);
            initBorrowBalance = await getBalance(user.address, destDebtToken!);
          }

          // 2. user obtains a quotation for leveraging src token
          const leverageLongInfo = await adapter.leverageLong({ account, portfolio, srcToken, srcAmount, destToken });

          // 3. user needs to permit the Protocolink user agent to borrow for the user
          const estimateResult = await apisdk.estimateRouterData(
            { chainId, account, logics: leverageLongInfo.logics },
            { permit2Type }
          );
          expect(estimateResult.approvals.length).to.eq(expects.approvalLength);
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }

          // 4. user obtains a leverage long transaction request
          expect(leverageLongInfo.logics.length).to.eq(expects.logicLength);
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics: leverageLongInfo.logics,
          });
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          // 5. user's supply balance will increase.
          // 5-1. due to the slippage caused by the swap, we need to calculate the minimum leverage amount.
          let supplyBalance;
          if (protocolId === 'compound-v3') {
            const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
            supplyBalance = await service.getCollateralBalance(marketId, user.address, leverageAmount.token);
          } else {
            supplyBalance = await getBalance(user.address, srcAToken!);
          }
          const minimumLeverageAmount = new common.TokenAmount(leverageAmount.token).setWei(
            common.calcSlippage(leverageAmount.amountWei, slippage)
          );
          expect(supplyBalance.gte(initSupplyBalance.clone().add(minimumLeverageAmount.amount))).to.be.true;

          // 6. user's borrow balance will increase.
          // 6-1. As the block number increases, the initial borrow balance will also increase.
          let borrowBalance, leverageBorrowAmount;
          if (protocolId === 'compound-v3') {
            const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
            borrowBalance = await service.getBorrowBalance(marketId, user.address);
            leverageBorrowAmount = new common.TokenAmount(leverageLongInfo.logics[3].fields.output);
          } else {
            borrowBalance = await getBalance(user.address, destDebtToken!);
            leverageBorrowAmount = new common.TokenAmount(leverageLongInfo.logics[4].fields.output);
          }
          expect(borrowBalance.gte(initBorrowBalance.clone().add(leverageBorrowAmount.amount))).to.be.true;
        });
      }
    );
  });
});
