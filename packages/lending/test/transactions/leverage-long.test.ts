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
import * as morphoblue from 'src/protocols/morphoblue/tokens';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import * as spark from 'src/protocols/spark/tokens';

describe('Transaction: Leverage Long', function () {
  const chainId = 1;
  const permit2Type = 'approve';
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;
  let service: logics.compoundv3.Service | logics.morphoblue.Service;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    await claimToken(chainId, '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E', mainnetTokens.USDC, '1000');
    await claimToken(chainId, '0x0E79368B079910b31e71Ce1B2AE510461359128D', mainnetTokens.USDC, '1000');
    await claimToken(chainId, '0x06e4cb4f3ba9a2916b6384acbdeaa74daaf91550', mainnetTokens.USDC, '1000');
    await claimToken(chainId, '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111', mainnetTokens.USDC, '1000');
    await claimToken(chainId, '0x9cbf099ff424979439dfba03f00b5961784c06ce', mainnetTokens.USDC, '1000');
    await claimToken(chainId, '0x8bf7058bfe4cf0d1fdfd41f43816c5555c17431d', mainnetTokens.DAI, '1000');
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
          logicLength: 6,
        },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0x0E79368B079910b31e71Ce1B2AE510461359128D',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcAToken: radiantV2.mainnetTokens.rWETH,
        destToken: mainnetTokens.USDC,
        destDebtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
        expects: {
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
          logicLength: 6,
        },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        account: '0x9cbf099ff424979439dfba03f00b5961784c06ce',
        srcToken: morphoblue.mainnetTokens.wstETH,
        srcAmount: '0.001',
        destToken: mainnetTokens.USDC,
        expects: {
          logicLength: 5,
        },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        account: '0x8bf7058bfe4cf0d1fdfd41f43816c5555c17431d',
        srcToken: mainnetTokens.WETH,
        srcAmount: '1',
        srcAToken: spark.mainnetTokens.spWETH,
        destToken: mainnetTokens.DAI,
        destDebtToken: '0xf705d2B7e92B3F38e6ae7afaDAA2fEE110fE5914', // DAI_variableDebtToken
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
          logicLength: 5,
        },
      },
    ];

    testCases.forEach(
      ({ protocolId, marketId, account, srcToken, srcAmount, srcAToken, destToken, destDebtToken, expects }, i) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          user = await hre.ethers.getImpersonatedSigner(account);
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

          // 1. get user positions
          let initSupplyBalance, initBorrowBalance;

          if (protocolId === 'compound-v3') {
            service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
          } else if (protocolId === 'morphoblue') {
            service = new logics.morphoblue.Service(chainId, hre.ethers.provider);
          }

          if (service) {
            initSupplyBalance = await service.getCollateralBalance(marketId, user.address, srcToken);
            initBorrowBalance = await service.getBorrowBalance(marketId, user.address);
          } else {
            initSupplyBalance = await getBalance(user.address, srcAToken!);
            initBorrowBalance = await getBalance(user.address, destDebtToken!);
          }

          // 2. user obtains a quotation for leveraging src token
          const leverageLongInfo = await adapter.leverageLong({ account, portfolio, srcToken, srcAmount, destToken });
          const leverageAmount = new common.TokenAmount(leverageLongInfo.logics[1].fields.output);

          // 3. user needs to permit the Protocolink user agent to borrow for the user
          const estimateResult = await apisdk.estimateRouterData(
            { chainId, account, logics: leverageLongInfo.logics },
            { permit2Type }
          );
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
          const supplyBalance = service
            ? await service.getCollateralBalance(marketId, user.address, leverageAmount.token)
            : await getBalance(user.address, srcAToken!);

          const minimumLeverageAmount = new common.TokenAmount(leverageAmount.token).setWei(
            common.calcSlippage(leverageAmount.amountWei, slippage)
          );
          expect(supplyBalance.gte(initSupplyBalance.clone().add(minimumLeverageAmount.amount))).to.be.true;

          // 6. user's borrow balance will increase.
          // 6-1. As the block number increases, the initial borrow balance will also increase.
          let borrowBalance, leverageBorrowAmount;
          if (service) {
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
