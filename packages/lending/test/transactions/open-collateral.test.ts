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

describe('Transaction: Open By Collateral', function () {
  const chainId = 1;
  const slippage = 1000;
  const initSupplyAmount = '5';

  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.USDT, '10000');
    await claimToken(chainId, user.address, mainnetTokens.WETH, initSupplyAmount);
    await claimToken(chainId, user.address, morphoblue.mainnetTokens.wstETH, initSupplyAmount);
  });

  snapshotAndRevertEach();

  context('Test Open By Collateral', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        hasCollateral: true,
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        leverageCollateralAmount: '1',
        debtToken: mainnetTokens.USDC,
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        hasCollateral: false,
        zapToken: mainnetTokens.USDT,
        zapAmount: '10000',
        collateralToken: mainnetTokens.WETH,
        leverageCollateralAmount: '1',
        debtToken: mainnetTokens.USDC,
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        hasCollateral: true,
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        leverageCollateralAmount: '1',
        debtToken: mainnetTokens.USDC,
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        hasCollateral: false,
        zapToken: mainnetTokens.USDT,
        zapAmount: '5000',
        collateralToken: mainnetTokens.WETH,
        leverageCollateralAmount: '1',
        // collateralAToken: spark.mainnetTokens.spWETH,
        debtToken: mainnetTokens.DAI,
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        hasCollateral: true,
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: mainnetTokens.WETH,
        leverageCollateralAmount: '1',
        debtToken: mainnetTokens.USDC,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        hasCollateral: true,
        zapToken: mainnetTokens.USDT,
        zapAmount: '1000',
        collateralToken: morphoblue.mainnetTokens.wstETH,
        leverageCollateralAmount: '1',
        debtToken: mainnetTokens.USDC,
        expects: { logicLength: 6 },
      },
    ];

    testCases.forEach(
      (
        {
          protocolId,
          marketId,
          hasCollateral,
          zapToken,
          zapAmount,
          collateralToken,
          leverageCollateralAmount,
          debtToken,
          expects,
        },
        i
      ) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          // 0. prep user positions
          const account = user.address;
          const initCollateralBalance = new common.TokenAmount(collateralToken, initSupplyAmount);
          if (hasCollateral) {
            await utils.deposit(chainId, protocolId, marketId, user, initCollateralBalance);
          }

          // 1. user obtains a quotation for open by collateral
          const expectedCollateralBalance = initCollateralBalance.clone().add(leverageCollateralAmount);
          const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
          const openCollateralInfo = await adapter.openByCollateral(
            account,
            portfolio,
            zapToken,
            zapAmount,
            collateralToken,
            expectedCollateralBalance.amount,
            debtToken,
            slippage
          );

          const logics = openCollateralInfo.logics;
          expect(openCollateralInfo.error).to.be.undefined;
          expect(logics.length).to.eq(expects.logicLength);

          // 2. user needs to permit the Protocolink user agent to borrow for the user
          const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }
          // 2-1. user sign permit data
          const permitData = estimateResult.permitData;
          expect(permitData).to.not.be.undefined;
          const { domain, types, values } = permitData!;
          const permitSig = await user._signTypedData(domain, types, values);

          // 3. user obtains a leverage by collateral transaction request
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics,
            permitData,
            permitSig,
          });
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          // 4. user's supply balance will increase.
          const protocol = adapter.getProtocol(protocolId);
          const collateralBalance = await utils.getCollateralBalance(
            chainId,
            protocol,
            marketId,
            user,
            collateralToken
          );
          // 4-1. due to the slippage caused by the swap, we need to calculate the minimum and maximum leverage amount.
          const [minLeverageAmount, maxLeverageAmount] = utils.bpsBound(leverageCollateralAmount, slippage);
          expect(collateralBalance!.gte(initCollateralBalance.clone().add(minLeverageAmount))).to.be.true;
          expect(collateralBalance!.lte(initCollateralBalance.clone().add(maxLeverageAmount))).to.be.true;
        });
      }
    );
  });
});
