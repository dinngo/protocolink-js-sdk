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

describe('Transaction: Close', function () {
  const chainId = 1;
  const initSupplyAmount = '5';
  const initBorrowAmount = '1000';
  const slippage = 1000;

  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, initSupplyAmount);
  });

  snapshotAndRevertEach();

  context('Test Close build positions', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        borrowToken: mainnetTokens.USDC,
        withdrawalToken: mainnetTokens.ETH,
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        borrowToken: mainnetTokens.USDC,
        withdrawalToken: mainnetTokens.ETH,
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        borrowToken: mainnetTokens.USDC,
        withdrawalToken: mainnetTokens.USDT,
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        supplyToken: mainnetTokens.WETH,
        borrowToken: mainnetTokens.DAI,
        withdrawalToken: mainnetTokens.USDT,
        expects: { logicLength: 7 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, supplyToken, borrowToken, withdrawalToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        // 0. prep user positions
        const account = user.address;
        const protocol = adapter.getProtocol(protocolId);
        const initCollateralBalance = new common.TokenAmount(supplyToken, initSupplyAmount);
        const initBorrowBalance = new common.TokenAmount(borrowToken, initBorrowAmount);
        await utils.deposit(chainId, protocolId, marketId, user, initCollateralBalance);
        await utils.borrow(chainId, protocolId, marketId, user, initBorrowBalance);

        // 1. user obtains a quotation for close positions
        const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const closeInfo = await adapter.close({ account, portfolio, withdrawalToken, slippage });
        const logics = closeInfo.logics;
        expect(closeInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);

        // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }
        // 2-1. user sign permit data
        const permitData = estimateResult.permitData;
        expect(permitData).to.not.be.undefined;
        const { domain, types, values } = permitData!;
        const permitSig = await user._signTypedData(domain, types, values);

        // 3. user obtains a close transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics,
          permitData,
          permitSig,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's borrow balance should be zero.
        const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, borrowToken);
        expect(borrowBalance!.amount).to.be.eq('0');

        // 5. user's collateral balance should decrease.
        // 5-1. collateral grows when the block of getting api data is different from the block of executing tx
        const collateralBalance = await utils.getCollateralBalance(chainId, protocol, marketId, user, supplyToken);
        const withdrawAmount = new common.TokenAmount(logics[3].fields.input);
        expect(collateralBalance!.gte(initCollateralBalance.clone().sub(withdrawAmount.amount))).to.be.true;
      });
    });
  });

  context('Test Close on-chain positions', function () {
    const testCases = [
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.ETH,
        account: '0x4AAB5CbFe493fc2AC18C46A68eF42c58ba06C9BD',
        withdrawalToken: mainnetTokens.USDT,
        supplyToken: morphoblue.mainnetTokens.wstETH,
        borrowToken: mainnetTokens.WETH,
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        account: '0x4AAB5CbFe493fc2AC18C46A68eF42c58ba06C9BD',
        withdrawalToken: mainnetTokens.USDT,
        supplyToken: morphoblue.mainnetTokens.wstETH,
        borrowToken: mainnetTokens.WETH,
        expects: { logicLength: 6 },
      },
    ];

    testCases.forEach(({ protocolId, marketId, account, withdrawalToken, supplyToken, borrowToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const permit2Type = 'approve';
        const protocol = adapter.getProtocol(protocolId);

        user = await hre.ethers.getImpersonatedSigner(account);
        const initCollateralBalance = await utils.getCollateralBalance(chainId, protocol, marketId, user, supplyToken);

        // 1. user obtains a quotation for deleveraging dest token
        const portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);
        const closeInfo = await adapter.close({ account, portfolio, withdrawalToken });
        const logics = closeInfo.logics;
        expect(closeInfo.error).to.be.undefined;
        expect(logics.length).to.eq(expects.logicLength);

        // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
        const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics }, { permit2Type });
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        // 3. user obtains a close transaction request
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's borrow balance should be zero.
        const borrowBalance = await utils.getBorrowBalance(chainId, protocolId, marketId, user, borrowToken);
        expect(borrowBalance!.amount).to.be.eq('0');

        // 5. user's collateral balance should decrease.
        // 5-1. collateral grows when the block of getting api data is different from the block of executing tx
        const collateralBalance = await utils.getCollateralBalance(chainId, protocol, marketId, user, supplyToken);
        const withdrawAmount = new common.TokenAmount(logics[3].fields.output);
        expect(collateralBalance!.gte(initCollateralBalance!.clone().sub(withdrawAmount.amount))).to.be.true;
      });
    });
  });
});
