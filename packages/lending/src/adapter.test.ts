// TODO: all chain and all protocol adapter.getXXXXX test

import { Adapter } from './adapter';
import { LendingProtocol } from './protocols/aave-v3/lending-protocol';
import { LendingSwapper } from './swappers/paraswap-v5';
import { Portfolio } from './protocol.portfolio';
import { expect } from 'chai';
import { mainnetTokens } from '@protocolink/test-helpers';
import { providers } from 'ethers';

const chainId = 1;
const rpcUrl = 'https://rpc.ankr.com/eth';
const provider = new providers.JsonRpcProvider(rpcUrl);

const collateralSwapTestCases = [
  {
    protocolId: 'aave-v3',
    marketId: 'mainnet',
    account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
    srcToken: mainnetTokens.WBTC,
    srcAmount: '1',
    destToken: mainnetTokens.WETH,
    logicLength: 7,
  },
];

const debtSwapTestCases = [
  {
    protocolId: 'aave-v3',
    marketId: 'mainnet',
    account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
    srcToken: mainnetTokens.USDC,
    srcAmount: '1',
    destToken: mainnetTokens.DAI,
    logicLength: 5,
  },
];

const leverageLongTestCases = [
  {
    protocolId: 'aave-v3',
    marketId: 'mainnet',
    account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
    srcToken: mainnetTokens.WETH,
    srcAmount: '1',
    destToken: mainnetTokens.USDC,
    logicLength: 6,
  },
];

const leverageShortTestCases = [
  {
    protocolId: 'aave-v3',
    marketId: 'mainnet',
    account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
    srcToken: mainnetTokens.WBTC,
    srcAmount: '1',
    destToken: mainnetTokens.USDC,
    logicLength: 6,
  },
];

const deleverageTestCases = [
  {
    protocolId: 'aave-v3',
    marketId: 'mainnet',
    account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
    srcToken: mainnetTokens.USDC,
    srcAmount: '1000',
    destToken: mainnetTokens.WBTC,
    logicLength: 6,
  },
];

const zapSupplyTestCases = [
  {
    protocolId: 'aave-v3',
    marketId: 'mainnet',
    account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
    srcToken: mainnetTokens.USDC,
    srcAmount: '100',
    destToken: mainnetTokens.WBTC,
    logicLength: 2,
  },
];

const zapWithdrawTestCases = [
  {
    protocolId: 'aave-v3',
    marketId: 'mainnet',
    account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
    srcToken: mainnetTokens.WBTC,
    srcAmount: '1',
    destToken: mainnetTokens.USDC,
    logicLength: 2,
  },
];

const zapBorrowTestCases = [
  {
    protocolId: 'aave-v3',
    marketId: 'mainnet',
    account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
    srcToken: mainnetTokens.USDC,
    srcAmount: '1000',
    destToken: mainnetTokens.WBTC,
    logicLength: 2,
  },
];

// const zapRepayTestCases = [
//   {
//     srcToken: mainnetTokens.USDC,
//     srcAmount: '1',
//     destToken: mainnetTokens.USDT,
//   },
// ];

describe('Test Adapater', function () {
  Adapter.registerProtocol(LendingProtocol);
  Adapter.registerSwapper(LendingSwapper);
  const adapter = new Adapter(chainId, provider);

  let portfolio: Portfolio;

  before(async function () {});

  // it('Test Portfolios', async function () {
  //   const account = '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550';
  //   const portfolios = await adapter.getPortfolios(account);
  //   portfolio = portfolios.find((portfolio) => portfolio.protocolId === protocolId)!;
  //   expect(portfolio.supplies).to.have.lengthOf.above(0);
  //   expect(portfolio.borrows).to.have.lengthOf.above(0);
  // });

  context('Test CollateralSwap', function () {
    collateralSwapTestCases.forEach((params, i) => {
      it(`case ${i + 1} - ${params.protocolId}:${params.marketId}`, async function () {
        portfolio = await adapter.getPortfolio(params.account, params.protocolId, params.marketId);
        const collateralSwapInfo = await adapter.collateralSwap({
          account: params.account,
          portfolio,
          srcToken: params.srcToken,
          srcAmount: params.srcAmount,
          destToken: params.destToken,
        });

        expect(collateralSwapInfo).to.include.all.keys('destAmount', 'afterPortfolio', 'logics');
        expect(parseFloat(collateralSwapInfo.destAmount!)).above(0);
        expect(collateralSwapInfo.logics).to.have.lengthOf(params.logicLength);
      });
    });
  });

  context('Test DebtSwap', function () {
    debtSwapTestCases.forEach((params, i) => {
      it(`case ${i + 1} - ${params.protocolId}:${params.marketId}`, async function () {
        portfolio = await adapter.getPortfolio(params.account, params.protocolId, params.marketId);
        const debtSwapInfo = await adapter.debtSwap({
          account: params.account,
          portfolio,
          srcToken: params.srcToken,
          srcAmount: params.srcAmount,
          destToken: params.destToken,
        });

        expect(debtSwapInfo).to.include.all.keys('destAmount', 'afterPortfolio', 'logics');
        expect(parseFloat(debtSwapInfo.destAmount!)).above(0);
        expect(debtSwapInfo.logics).to.have.lengthOf(params.logicLength);
      });
    });
  });

  context('Test LeverageLong', function () {
    leverageLongTestCases.forEach((params, i) => {
      it(`case ${i + 1} - ${params.protocolId}:${params.marketId}`, async function () {
        portfolio = await adapter.getPortfolio(params.account, params.protocolId, params.marketId);
        const leverageLongInfo = await adapter.leverageLong({
          account: params.account,
          portfolio,
          srcToken: params.srcToken,
          srcAmount: params.srcAmount,
          destToken: params.destToken,
        });

        expect(leverageLongInfo).to.include.all.keys('destAmount', 'afterPortfolio', 'logics');
        expect(leverageLongInfo.logics).to.have.lengthOf(params.logicLength);
      });
    });
  });

  context('Test LeverageShort', function () {
    leverageShortTestCases.forEach((params, i) => {
      it(`case ${i + 1} - ${params.protocolId}:${params.marketId}`, async function () {
        portfolio = await adapter.getPortfolio(params.account, params.protocolId, params.marketId);
        const leverageShortInfo = await adapter.leverageShort({
          account: params.account,
          portfolio,
          srcToken: params.srcToken,
          srcAmount: params.srcAmount,
          destToken: params.destToken,
        });

        expect(leverageShortInfo).to.include.all.keys('destAmount', 'afterPortfolio', 'logics');
        expect(leverageShortInfo.logics).to.have.lengthOf(params.logicLength);
      });
    });
  });

  context('Test Deleverage', function () {
    deleverageTestCases.forEach((params, i) => {
      it(`case ${i + 1} - ${params.protocolId}:${params.marketId}`, async function () {
        portfolio = await adapter.getPortfolio(params.account, params.protocolId, params.marketId);
        const deleverageInfo = await adapter.deleverage({
          account: params.account,
          portfolio,
          srcToken: params.srcToken,
          srcAmount: params.srcAmount,
          destToken: params.destToken,
        });

        expect(deleverageInfo).to.include.all.keys('destAmount', 'afterPortfolio', 'logics');
        expect(parseFloat(deleverageInfo.destAmount!)).above(0);
        expect(deleverageInfo.logics).to.have.lengthOf(params.logicLength);
      });
    });
  });

  context('Test ZapSupply', function () {
    zapSupplyTestCases.forEach((params, i) => {
      it(`case ${i + 1} - ${params.protocolId}:${params.marketId}`, async function () {
        portfolio = await adapter.getPortfolio(params.account, params.protocolId, params.marketId);
        const zapSupplyInfo = await adapter.zapSupply({
          account: params.account,
          portfolio,
          srcToken: params.srcToken,
          srcAmount: params.srcAmount,
          destToken: params.destToken,
        });

        expect(zapSupplyInfo).to.include.all.keys('destAmount', 'afterPortfolio', 'logics');
        expect(parseFloat(zapSupplyInfo.destAmount!)).above(0);
        expect(zapSupplyInfo.logics).to.have.lengthOf(params.logicLength);
      });
    });
  });

  context('Test ZapWithdraw', function () {
    zapWithdrawTestCases.forEach((params, i) => {
      it(`case ${i + 1} - ${params.protocolId}:${params.marketId}`, async function () {
        portfolio = await adapter.getPortfolio(params.account, params.protocolId, params.marketId);
        const zapWithdrawInfo = await adapter.zapWithdraw({
          account: params.account,
          portfolio,
          srcToken: params.srcToken,
          srcAmount: params.srcAmount,
          destToken: params.destToken,
        });

        expect(zapWithdrawInfo).to.include.all.keys('destAmount', 'afterPortfolio', 'logics');
        expect(parseFloat(zapWithdrawInfo.destAmount!)).above(0);
        expect(zapWithdrawInfo.logics).to.have.lengthOf(params.logicLength);
      });
    });
  });

  context('Test ZapBorrow', function () {
    zapBorrowTestCases.forEach((params, i) => {
      it(`case ${i + 1} - ${params.protocolId}:${params.marketId}`, async function () {
        portfolio = await adapter.getPortfolio(params.account, params.protocolId, params.marketId);
        const ZapBorrowInfo = await adapter.zapBorrow({
          account: params.account,
          portfolio,
          srcToken: params.srcToken,
          srcAmount: params.srcAmount,
          destToken: params.destToken,
        });

        expect(ZapBorrowInfo).to.include.all.keys('destAmount', 'afterPortfolio', 'logics');
        expect(parseFloat(ZapBorrowInfo.destAmount!)).above(0);
        expect(ZapBorrowInfo.logics).to.have.lengthOf(params.logicLength);
      });
    });
  });

  // context('Test ZapRepay', function () {
  //   zapRepayTestCases.forEach((params, i) => {
  //     it(`case ${i + 1} - ${params.protocolId}:${params.marketId}`, async function () {
  //       portfolio = await adapter.getPortfolio(params.account, params.protocolId, params.marketId);
  //       const zapRepayInfo = await adapter.zapRepay({
  //         account: params.account,
  //         portfolio,
  //         srcToken: params.srcToken,
  //         srcAmount: params.srcAmount,
  //         destToken: params.destToken,
  //       });

  //       expect(zapRepayInfo).to.include.all.keys('destAmount', 'afterPortfolio', 'logics');
  //       expect(parseFloat(zapRepayInfo.destAmount!)).above(0);
  //       expect(zapRepayInfo.logics).to.have.lengthOf(params.logicLength);
  //     });
  //   });
  // });
});
