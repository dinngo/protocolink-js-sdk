import { Adapter } from 'src/adapter';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Zap Borrow', function () {
  const chainId = 1;
  const slippage = 1000;
  const initSupplyAmount = '2';

  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, initSupplyAmount);
    await claimToken(chainId, user.address, logics.morphoblue.mainnetTokens.wstETH, initSupplyAmount);
  });

  snapshotAndRevertEach();

  context('Test ZapBorrow', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.USDT,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.USDT,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.WBTC,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.DAI,
        srcAmount: '100',
        destToken: mainnetTokens.WBTC,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        supplyToken: mainnetTokens.WETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.USDT,
        expects: { logicLength: 2 },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        supplyToken: logics.morphoblue.mainnetTokens.wstETH,
        srcToken: mainnetTokens.USDC,
        srcAmount: '100',
        destToken: mainnetTokens.USDT,
        expects: { logicLength: 2 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, supplyToken, srcToken, srcAmount, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        // 0. prep user positions
        const account = user.address;
        await utils.deposit(chainId, protocolId, marketId, user, new common.TokenAmount(supplyToken, initSupplyAmount));

        // 1. user obtains a quotation for zap borrow
        const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const zapBorrowInfo = await adapter.zapBorrow({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
          slippage,
        });
        const logics = zapBorrowInfo.logics;
        expect(zapBorrowInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);

        // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        const permitData = estimateResult.permitData;
        expect(permitData).to.be.undefined;

        // 3. user obtains a zap borrow transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's borrow balance should increase.
        const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, srcToken);
        const borrowAmount = new common.TokenAmount(srcToken, srcAmount);

        // 4-1. debt grows when the block of getting api data is different from the block of executing tx
        const minBorrowBalance = common.calcSlippage(borrowAmount.amountWei, 1);
        expect(borrowBalance!.amountWei).to.be.gte(minBorrowBalance);

        // 5. user's dest token balance should increase
        // 5-1. rate may change when the block of getting api data is different from the block of executing tx
        await expect(user.address).to.changeBalance(destToken, zapBorrowInfo.destAmount, slippage);
      });
    });
  });
});
