import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as apisdk from '@protocolink/api';
import { claimToken, getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as morphoblue from 'src/protocols/morphoblue/tokens';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import * as spark from 'src/protocols/spark/tokens';
import * as utils from 'test/utils';

describe('Transaction: Open By Collateral', function () {
  const chainId = 1;
  const permit2Type = 'approve';

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    await claimToken(chainId, '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E', mainnetTokens.ETH, '15'); // gas
    await claimToken(chainId, '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0x0E79368B079910b31e71Ce1B2AE510461359128D', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0xee2826453a4fd5afeb7ceffeef3ffa2320081268', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0x9cbf099ff424979439dfba03f00b5961784c06ce', mainnetTokens.USDT, '2000');
  });

  snapshotAndRevertEach();

  context('Test Open By Collateral', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        collateralAmountDelta: '1',
        collateralAToken: aaveV2.mainnetTokens.aWETH,
        debtToken: mainnetTokens.USDC,
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0x0E79368B079910b31e71Ce1B2AE510461359128D',
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        collateralAmountDelta: '1',
        collateralAToken: radiantV2.mainnetTokens.rWETH,
        debtToken: mainnetTokens.USDC,
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        collateralAmountDelta: '1',
        collateralAToken: aaveV3.mainnetTokens.aEthWETH,
        debtToken: mainnetTokens.USDC,
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        account: '0xee2826453a4fd5afeb7ceffeef3ffa2320081268',
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        collateralAmountDelta: '1',
        collateralAToken: spark.mainnetTokens.spWETH,
        debtToken: mainnetTokens.DAI,
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        collateralAmountDelta: '1',
        debtToken: mainnetTokens.USDC,
        service: new logics.compoundv3.Service(chainId, hre.ethers.provider),
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        account: '0x9cbf099ff424979439dfba03f00b5961784c06ce',
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: morphoblue.mainnetTokens.wstETH,
        collateralAmountDelta: '1',
        debtToken: mainnetTokens.USDC,
        service: new logics.morphoblue.Service(chainId, hre.ethers.provider),
        expects: { logicLength: 6 },
      },
    ];

    testCases.forEach(
      (
        {
          protocolId,
          marketId,
          account,
          zapToken,
          zapAmount,
          collateralToken,
          collateralAmountDelta,
          collateralAToken,
          debtToken,
          service,
          expects,
        },
        i
      ) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          user = await hre.ethers.getImpersonatedSigner(account);
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

          const initSupplyBalance = service
            ? await service.getCollateralBalance(marketId, user.address, collateralToken)
            : await getBalance(user.address, collateralAToken!);

          const expectedCollateralBalance = initSupplyBalance.add(collateralAmountDelta);
          const collateralAmount = expectedCollateralBalance.amount;

          // 1. user obtains a quotation for open by collateral
          const openCollateralInfo = await adapter.openByCollateral(
            account,
            portfolio,
            zapToken,
            zapAmount,
            collateralToken,
            collateralAmount,
            debtToken
          );

          const logics = openCollateralInfo.logics;
          expect(openCollateralInfo.error).to.be.undefined;
          expect(logics.length).to.eq(expects.logicLength);

          // 2. user needs to permit the Protocolink user agent to borrow for the user
          const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics }, { permit2Type });
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }

          // 3. user obtains a leverage by collateral transaction request
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics,
          });
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          // 4. user's supply balance will increase.
          // 4-1. due to the slippage caused by the swap, we need to calculate the minimum leverage amount.
          const supplyBalance = service
            ? await service.getCollateralBalance(marketId, user.address, collateralToken)
            : await getBalance(user.address, collateralAToken!);
          const [, max] = utils.bpsBound(collateralAmount);
          const maxExpectedCollateralBalance = expectedCollateralBalance.clone().set(max);
          expect(supplyBalance.gte(expectedCollateralBalance));
          expect(supplyBalance.lte(maxExpectedCollateralBalance));
        });
      }
    );
  });
});
