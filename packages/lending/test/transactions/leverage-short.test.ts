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
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import { spark } from '@protocolink/logics';

describe('Transaction: Leverage Short', function () {
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

  context('Test Leverage Short', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcDebtToken: '0xF63B34710400CAd3e044cFfDcAb00a0f32E33eCf', // variableDebtWETH
        destToken: mainnetTokens.USDC,
        destAToken: aaveV2.mainnetTokens.aUSDC,
        expects: {
          logicLength: 6,
        },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcDebtToken: '0xDf1E9234d4F10eF9FED26A7Ae0EF43e5e03bfc31', // vdWETH
        destToken: mainnetTokens.USDC,
        destAToken: radiantV2.mainnetTokens.rUSDC,
        expects: {
          logicLength: 6,
        },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        srcToken: mainnetTokens.WBTC,
        srcAmount: '1',
        srcDebtToken: '0x40aAbEf1aa8f0eEc637E0E7d92fbfFB2F26A8b7B', // variableDebtEthWBTC
        destToken: mainnetTokens.USDC,
        destAToken: aaveV3.mainnetTokens.aEthUSDC,
        expects: {
          logicLength: 6,
        },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        account: '0x8bf7058bfe4cf0d1fdfd41f43816c5555c17431d',
        srcToken: mainnetTokens.DAI,
        srcAmount: '1',
        srcDebtToken: '0xf705d2B7e92B3F38e6ae7afaDAA2fEE110fE5914', // DAI_variableDebtToken
        destToken: mainnetTokens.WETH,
        destAToken: spark.mainnetTokens.spWETH,
        expects: {
          approvalLength: 1,
          logicLength: 6,
        },
      },
    ];

    testCases.forEach(
      ({ protocolId, marketId, account, srcToken, srcAmount, srcDebtToken, destToken, destAToken, expects }, i) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          user = await hre.ethers.getImpersonatedSigner(account);
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

          const initSupplyBalance = await getBalance(user.address, destAToken!);
          const initBorrowBalance = await getBalance(user.address, srcDebtToken!);

          // 1. user obtains a quotation for leveraging short src token
          const leverageShortInfo = await adapter.leverageShort({
            account,
            portfolio,
            srcToken,
            srcAmount,
            destToken,
          });

          const leverageAmount = new common.TokenAmount(leverageShortInfo.logics[1].fields.output);

          // 2. user needs to permit the Protocolink user agent to borrow for the user
          const estimateResult = await apisdk.estimateRouterData(
            { chainId, account, logics: leverageShortInfo.logics },
            { permit2Type }
          );
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }

          // 3. user obtains a leverage short transaction request
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics: leverageShortInfo.logics,
          });
          expect(leverageShortInfo.logics.length).to.eq(expects.logicLength);
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          // 4. user's supply balance will increase.
          // 4-1. due to the slippage caused by the swap, we need to calculate the minimum leverage amount.
          const supplyBalance = await getBalance(user.address, destAToken);
          const minimumLeverageAmount = new common.TokenAmount(leverageAmount.token).setWei(
            common.calcSlippage(leverageAmount.amountWei, slippage)
          );
          expect(supplyBalance.gte(initSupplyBalance.clone().add(minimumLeverageAmount.amount))).to.be.true;

          // 5. user's borrow balance will increase.
          // 5-1. As the block number increases, the initial borrow balance will also increase.
          const borrowBalance = await getBalance(user.address, srcDebtToken);
          const leverageBorrowAmount = new common.TokenAmount(leverageShortInfo.logics[4].fields.output);
          expect(borrowBalance.gte(initBorrowBalance.clone().add(leverageBorrowAmount.amount))).to.be.true;
        });
      }
    );
  });
});
