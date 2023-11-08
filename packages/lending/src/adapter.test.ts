import { Adapter } from './adapter';
import {
  CollateralSwapParams,
  DebtSwapParams,
  DeleverageParams,
  LeverageLongParams,
  LeverageShortParams,
  ZapBorrowParams,
  ZapSupplyParams,
  ZapRepayParams,
  ZapWithdrawParams,
} from './adapter.type';
import { LendingFlashLoaner } from './protocols/aave-v3/lending-flashloaner';
import { LendingProtocol } from './protocols/aave-v3/lending-protocol';
import { LendingSwaper } from './protocols/paraswap-v5/lending-swaper';
import { Portfolio } from './protocol.portfolio';
import { expect } from 'chai';
import { mainnetTokens } from '@protocolink/test-helpers';
import { providers } from 'ethers';

const account = '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB';
const rpcUrl = 'https://rpc.ankr.com/eth';
const provider = new providers.JsonRpcProvider(rpcUrl);

const collateralSwapTestCases: CollateralSwapParams[] = [
  {
    srcToken: mainnetTokens.USDC,
    srcAmount: '1',
    destToken: mainnetTokens.USDT,
  },
];

const debtSwapTestCases: DebtSwapParams[] = [
  {
    srcToken: mainnetTokens.USDC,
    srcAmount: '1',
    destToken: mainnetTokens.USDT,
  },
];

const leverageLongTestCases: LeverageLongParams[] = [
  {
    srcToken: mainnetTokens.USDC,
    srcAmount: '1',
    destToken: mainnetTokens.USDT,
  },
];

const leverageShortTestCases: LeverageShortParams[] = [
  {
    srcToken: mainnetTokens.USDC,
    srcAmount: '1',
    destToken: mainnetTokens.USDT,
  },
];

const deleverageTestCases: DeleverageParams[] = [
  {
    srcToken: mainnetTokens.USDC,
    srcAmount: '1',
    destToken: mainnetTokens.USDT,
  },
];

const zapSupplyTestCases: ZapSupplyParams[] = [
  {
    srcToken: mainnetTokens.USDC,
    srcAmount: '1',
    destToken: mainnetTokens.USDT,
  },
];

const zapWithdrawTestCases: ZapWithdrawParams[] = [
  {
    srcToken: mainnetTokens.USDC,
    srcAmount: '1',
    destToken: mainnetTokens.USDT,
  },
];

const zapBorrowTestCases: ZapBorrowParams[] = [
  {
    srcToken: mainnetTokens.USDC,
    srcAmount: '1',
    destToken: mainnetTokens.USDT,
  },
];

const zapRepayTestCases: ZapRepayParams[] = [
  {
    srcToken: mainnetTokens.USDC,
    srcAmount: '1',
    destToken: mainnetTokens.USDT,
  },
];

describe('Lending AaveV3 SDK', function () {
  Adapter.registerProtocol(LendingProtocol);
  Adapter.registerFlashLoaner(LendingFlashLoaner);
  Adapter.registerSwaper(LendingSwaper);
  const adapter = new Adapter(1, provider);
  const protocolId = 'aavev3';

  let portfolio: Portfolio;

  before(async function () {
    const portfolios = await adapter.getPortfolios(account);
    console.log('portfolios', portfolios);
    portfolio = portfolios.find((portfolio) => portfolio.protocolId === protocolId)!;
  });

  it('Test Portfolios', async function () {
    expect(portfolio.supplies).to.have.lengthOf.above(0);
    expect(portfolio.borrows).to.have.lengthOf.above(0);
  });

  context('Test CollateralSwap', function () {
    collateralSwapTestCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const collateralSwapInfo = await adapter.getCollateralSwapQuotationAndLogics(
          protocolId,
          params,
          account,
          portfolio
        );

        expect(collateralSwapInfo).to.include.all.keys('fields', 'logics');
        expect(parseFloat(collateralSwapInfo.fields.destAmount)).above(0);
        expect(collateralSwapInfo.logics).to.have.lengthOf(6); // TODO: 7 after implement add fund logic
      });
    });
  });

  context('Test DebtSwap', function () {
    debtSwapTestCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const debtSwapInfo = await adapter.getDebtSwapQuotationAndLogics(protocolId, params, account, portfolio);

        expect(debtSwapInfo).to.include.all.keys('fields', 'logics');
        expect(parseFloat(debtSwapInfo.fields.destAmount)).above(0);
        expect(debtSwapInfo.logics).to.have.lengthOf(5);
      });
    });
  });

  context('Test LeverageLong', function () {
    leverageLongTestCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const leverageLongInfo = await adapter.getLeverageLongQuotationAndLogics(
          protocolId,
          params,
          account,
          portfolio
        );

        expect(leverageLongInfo).to.include.all.keys('fields', 'logics');
        expect(leverageLongInfo.logics).to.have.lengthOf(6);
      });
    });
  });

  context('Test LeverageShort', function () {
    leverageShortTestCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const leverageShortInfo = await adapter.getLeverageShortQuotationAndLogics(
          protocolId,
          params,
          account,
          portfolio
        );

        expect(leverageShortInfo).to.include.all.keys('fields', 'logics');
        expect(leverageShortInfo.logics).to.have.lengthOf(6);
      });
    });
  });

  context('Test Deleverage', function () {
    deleverageTestCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const deleverageInfo = await adapter.getDeleverageQuotationAndLogics(protocolId, params, account, portfolio);

        expect(deleverageInfo).to.include.all.keys('fields', 'logics');
        expect(parseFloat(deleverageInfo.fields.destAmount)).above(0);
        expect(deleverageInfo.logics).to.have.lengthOf(5); // TODO: 6 after implement add fund logic
      });
    });
  });

  context('Test ZapSupply', function () {
    zapSupplyTestCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const zapSupplyInfo = await adapter.getZapSupplyQuotationAndLogics(protocolId, params, account, portfolio);

        expect(zapSupplyInfo).to.include.all.keys('fields', 'logics');
        expect(parseFloat(zapSupplyInfo.fields.destAmount)).above(0);
        expect(zapSupplyInfo.logics).to.have.lengthOf(2);
      });
    });
  });

  context('Test ZapWithdraw', function () {
    zapWithdrawTestCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const zapWithdrawInfo = await adapter.getZapWithdrawQuotationAndLogics(protocolId, params, account, portfolio);

        expect(zapWithdrawInfo).to.include.all.keys('fields', 'logics');
        expect(parseFloat(zapWithdrawInfo.fields.destAmount)).above(0);
        expect(zapWithdrawInfo.logics).to.have.lengthOf(2);
      });
    });
  });

  context('Test ZapBorrow', function () {
    zapBorrowTestCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const ZapBorrowInfo = await adapter.getZapBorrowQuotationAndLogics(protocolId, params, account, portfolio);

        expect(ZapBorrowInfo).to.include.all.keys('fields', 'logics');
        expect(parseFloat(ZapBorrowInfo.fields.destAmount)).above(0);
        expect(ZapBorrowInfo.logics).to.have.lengthOf(2);
      });
    });
  });

  context('Test ZapRepay', function () {
    zapRepayTestCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const zapRepayInfo = await adapter.getZapRepayQuotationAndLogics(protocolId, params, account, portfolio);

        expect(zapRepayInfo).to.include.all.keys('fields', 'logics');
        expect(parseFloat(zapRepayInfo.fields.destAmount)).above(0);
        expect(zapRepayInfo.logics).to.have.lengthOf(2);
      });
    });
  });
});
