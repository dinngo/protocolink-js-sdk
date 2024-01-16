import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
// import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as morphoblue from 'src/protocols/morphoblue/tokens';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import { spark } from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Deleverage', function () {
  const chainId = 1;
  const permit2Type = 'approve';

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;
  let service: logics.compoundv3.Service | logics.morphoblue.Service;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
  });

  snapshotAndRevertEach();

  context('Test Deleverage', function () {
    const testCases = [
      // {
      //   // TODO: expect(borrowDifference.gte(minRepayAmount)).to.be.true = false
      //   // reason: poisition too big result in debt grows too fast
      //   protocolId: 'aave-v2',
      //   marketId: 'mainnet',
      //   account: '0x93f96d0775e3d915228bab5e91f5ef09262847aa', //'0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
      //   srcToken: mainnetTokens.USDC,
      //   srcAmount: '100',
      //   srcDebtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
      //   destToken: mainnetTokens.WETH,
      //   destAToken: aaveV2.mainnetTokens.aWETH,
      //   expects: {
      //     logicLength: 6,
      //   },
      // },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e',
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        srcDebtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
        destToken: mainnetTokens.USDC,
        destAToken: radiantV2.mainnetTokens.rUSDC,
        expects: {
          logicLength: 5,
        },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        srcToken: mainnetTokens.USDC,
        srcAmount: '1000',
        srcDebtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
        destToken: mainnetTokens.WBTC,
        destAToken: aaveV3.mainnetTokens.aEthWBTC,
        expects: {
          logicLength: 6,
        },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        account: '0x8bf7058bfe4cf0d1fdfd41f43816c5555c17431d',
        srcToken: mainnetTokens.DAI,
        srcAmount: '1000',
        srcDebtToken: '0xf705d2B7e92B3F38e6ae7afaDAA2fEE110fE5914', // DAI_variableDebtToken
        destToken: mainnetTokens.ETH,
        destAToken: spark.mainnetTokens.spWETH,
        expects: {
          approvalLength: 2,
          logicLength: 6,
        },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        srcToken: mainnetTokens.USDC,
        srcAmount: '1000',
        destToken: mainnetTokens.WBTC,
        expects: {
          logicLength: 5,
        },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        account: '0x9cbf099ff424979439dfba03f00b5961784c06ce',
        srcToken: mainnetTokens.USDC,
        srcAmount: '10000',
        destToken: morphoblue.mainnetTokens.wstETH,
        expects: {
          logicLength: 5,
        },
      },
    ];

    testCases.forEach(
      ({ protocolId, marketId, account, srcToken, srcAmount, srcDebtToken, destToken, destAToken, expects }, i) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          user = await hre.ethers.getImpersonatedSigner(account);
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

          let initCollateralBalance, initBorrowBalance;

          if (protocolId === 'compound-v3') {
            service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
          } else if (protocolId === 'morphoblue') {
            service = new logics.morphoblue.Service(chainId, hre.ethers.provider);
          }

          if (service) {
            initCollateralBalance = await service.getCollateralBalance(marketId, user.address, destToken);
            initBorrowBalance = await service.getBorrowBalance(marketId, user.address);
          } else {
            initCollateralBalance = await getBalance(user.address, destAToken!);
            initBorrowBalance = await getBalance(user.address, srcDebtToken!);
          }

          // 1. user obtains a quotation for deleveraging dest token
          const deleverageInfo = await adapter.deleverage({ account, portfolio, srcToken, srcAmount, destToken });

          // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
          const estimateResult = await apisdk.estimateRouterData(
            { chainId, account, logics: deleverageInfo.logics },
            { permit2Type }
          );
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }

          // 3. user obtains a deleverage transaction request
          expect(deleverageInfo.logics.length).to.eq(expects.logicLength);
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics: deleverageInfo.logics,
          });
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          let collateralBalance, deleverageWithdrawAmount, borrowBalance;
          if (service) {
            collateralBalance = await service.getCollateralBalance(marketId, user.address, destToken);
            deleverageWithdrawAmount = new common.TokenAmount(deleverageInfo.logics[3].fields.output);
            borrowBalance = await service.getBorrowBalance(marketId, user.address);
          } else {
            collateralBalance = await getBalance(user.address, destAToken!);
            deleverageWithdrawAmount = new common.TokenAmount(deleverageInfo.logics[3].fields.input);
            borrowBalance = await getBalance(user.address, srcDebtToken!);
          }

          // 4. user's collateral balance should decrease.
          // 4-1. collateral grows when the block of getting api data is different from the block of executing tx
          expect(collateralBalance.gte(initCollateralBalance.clone().sub(deleverageWithdrawAmount))).to.be.true;

          // 5. user's borrow balance should decrease.
          const borrowDifference = initBorrowBalance.clone().sub(borrowBalance);
          const repayAmount = new common.TokenAmount(srcToken, srcAmount);

          // 5-1. debt grows when the block of getting api data is different from the block of executing tx
          const [minRepay] = utils.bpsBound(repayAmount.amount, 100);
          const minRepayAmount = repayAmount.clone().set(minRepay);
          expect(borrowDifference.gte(minRepayAmount)).to.be.true;
          expect(borrowDifference.lte(repayAmount)).to.be.true;
        });
      }
    );
  });
});
