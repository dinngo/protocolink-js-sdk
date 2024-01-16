import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import * as spark from 'src/protocols/spark/tokens';
import * as utils from 'test/utils';

describe('Transaction: Collateral swap', function () {
  const chainId = 1;
  const permit2Type = 'approve';

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
  });

  snapshotAndRevertEach();

  context('Test Collateral swap', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        srcToken: mainnetTokens.WBTC,
        srcAmount: '1',
        srcAToken: aaveV2.mainnetTokens.aWBTC,
        destToken: mainnetTokens.WETH,
        destAToken: aaveV2.mainnetTokens.aWETH,
        expects: {
          logicLength: 7,
        },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0x0E79368B079910b31e71Ce1B2AE510461359128D',
        srcToken: mainnetTokens.WBTC,
        srcAmount: '1',
        srcAToken: radiantV2.mainnetTokens.rWBTC,
        destToken: mainnetTokens.WETH,
        destAToken: radiantV2.mainnetTokens.rWETH,
        expects: {
          logicLength: 7,
        },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        srcToken: mainnetTokens.WBTC,
        srcAmount: '1',
        srcAToken: aaveV3.mainnetTokens.aEthWBTC,
        destToken: mainnetTokens.WETH,
        destAToken: aaveV3.mainnetTokens.aEthWETH,
        expects: {
          logicLength: 7,
        },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        account: '0x8bf7058bfe4cf0d1fdfd41f43816c5555c17431d',
        srcToken: mainnetTokens.ETH,
        srcAmount: '1',
        srcAToken: spark.mainnetTokens.spWETH,
        destToken: spark.mainnetTokens.wstETH,
        destAToken: spark.mainnetTokens.spwstETH,
        expects: {
          approvalLength: 2,
          logicLength: 7,
        },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        srcToken: mainnetTokens.WBTC,
        srcAmount: '1',
        destToken: mainnetTokens.WETH,
        expects: {
          logicLength: 5,
        },
      },
    ];

    testCases.forEach(
      ({ protocolId, marketId, account, srcToken, srcAmount, srcAToken, destToken, destAToken, expects }, i) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          user = await hre.ethers.getImpersonatedSigner(account);
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

          let initSrcBalance, initDestBalance;
          if (protocolId === 'compound-v3') {
            const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
            initSrcBalance = await service.getCollateralBalance(marketId, user.address, srcToken);
            initDestBalance = await service.getCollateralBalance(marketId, user.address, destToken);
          } else {
            initSrcBalance = await getBalance(user.address, srcAToken!);
            initDestBalance = await getBalance(user.address, destAToken!);
          }

          // 1. user obtains a quotation for collateral swap srcToken to destToken
          const collateralSwapInfo = await adapter.collateralSwap({
            account,
            portfolio,
            srcToken,
            srcAmount,
            destToken,
          });

          // 2. user needs to allow the Protocolink user agent to withdraw on behalf of the user
          const estimateResult = await apisdk.estimateRouterData(
            { chainId, account, logics: collateralSwapInfo.logics },
            { permit2Type }
          );
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }

          // 3. user obtains a collateral swap transaction request
          expect(collateralSwapInfo.logics.length).to.eq(expects.logicLength);
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics: collateralSwapInfo.logics,
          });
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          let srcBalance, destBalance;
          if (protocolId === 'compound-v3') {
            const service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
            srcBalance = await service.getCollateralBalance(marketId, user.address, srcToken);
            destBalance = await service.getCollateralBalance(marketId, user.address, destToken);
          } else {
            srcBalance = await getBalance(user.address, srcAToken!);
            destBalance = await getBalance(user.address, destAToken!);
          }

          // 4. user's src token balance will decrease.
          expect(srcBalance.gte(initSrcBalance.clone().sub(srcAmount))).to.be.true;

          // 5. user's dest token balance will increase.
          // 5-1. rate may change when the block of getting api data is different from the block of executing tx
          const supplyAmount = new common.TokenAmount(destToken, collateralSwapInfo.destAmount);
          const [min, max] = utils.bpsBound(supplyAmount.amount);
          const maxSupplyAmount = supplyAmount.clone().set(max);
          const minSupplyAmount = supplyAmount.clone().set(min);
          expect(destBalance.clone().sub(initDestBalance).lte(maxSupplyAmount)).to.be.true;
          expect(destBalance.clone().sub(initDestBalance).gte(minSupplyAmount)).to.be.true;
        });
      }
    );
  });
});
