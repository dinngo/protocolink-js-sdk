import { Adapter } from 'src/adapter';
import { ID } from './configs';
import { LendingProtocol } from './lending-protocol';
import { Portfolio } from 'src/protocol.portfolio';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('Test Adapter for Radiant V2', async function () {
  const chainId = common.ChainId.mainnet;
  const blockTag = 20150000;
  let adapter: Adapter;
  let protocol: LendingProtocol;

  before(async function () {
    adapter = await Adapter.createAdapter(chainId);
    protocol = adapter.protocolMap[ID] as LendingProtocol;
    protocol.setBlockTag(blockTag);
  });

  context('Test openByCollateral', function () {
    const account = '0x9edcb464C0AfdD01a5Ffbd09309b437C7dadeAB3';
    const blockTag = 20150000;

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(blockTag);
      portfolio = await protocol.getPortfolio(account);
    });

    it('zero zapAmount', async function () {
      const zapToken = mainnetTokens.USDT;
      const zapAmount = '0';
      const collateralToken = mainnetTokens.ETH;
      const collateralAmount = '0';
      const debtToken = mainnetTokens.USDC;

      const { destAmount, logics, error } = await adapter.openByCollateral({
        account,
        portfolio,
        zapToken,
        zapAmount,
        collateralToken,
        collateralAmount,
        debtToken,
      });

      expect(error).to.be.undefined;
      expect(destAmount).to.eq('0');
      expect(logics).has.length(0);
    });

    it('zero collateralAmount', async function () {
      const zapToken = mainnetTokens.USDT;
      const zapAmount = '50000';
      const collateralToken = mainnetTokens.ETH;
      const collateralAmount = '0';
      const debtToken = mainnetTokens.USDC;

      const { destAmount, error } = await adapter.openByCollateral({
        account,
        portfolio,
        zapToken,
        zapAmount,
        collateralToken,
        collateralAmount,
        debtToken,
      });

      expect(error).to.be.undefined;
      expect(destAmount).to.eq('0');
    });

    it('success', async function () {
      const zapToken = mainnetTokens.USDT;
      const zapAmount = '1000';
      const collateralToken = mainnetTokens.ETH;
      const collateralAmount = '0.1';
      const debtToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.openByCollateral({
        account,
        portfolio,
        zapToken,
        zapAmount,
        collateralToken,
        collateralAmount,
        debtToken,
      });

      expect(error).to.be.undefined;
      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.supply(collateralToken, logics[3].fields.input.amount);
      expectedAfterPortfolio.borrow(debtToken, destAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(logics).has.length(7);
      expect(logics[0].rid).to.contain('swap-token');
      expect(logics[1].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[2].rid).to.contain('swap-token');
      expect(logics[3].rid).to.eq('radiant-v2:deposit');
      expect(logics[3].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[4].rid).to.eq('utility:send-token');
      expect(logics[4].fields.recipient).to.eq(account);
      expect(logics[4].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[5].rid).to.eq('radiant-v2:borrow');
      expect(logics[6].rid).to.eq('utility:flash-loan-aggregator');
    });
  });

  context('Test openByDebt', function () {
    const account = '0xBBaCb7F97BA96aa90E5603CFb47EaE09517C8731';
    const blockTag = 20150000;

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(blockTag);
      portfolio = await protocol.getPortfolio(account);
    });

    it('zero zapAmount', async function () {
      const zapToken = mainnetTokens.USDT;
      const zapAmount = '0';
      const collateralToken = mainnetTokens.ETH;
      const debtToken = mainnetTokens.USDC;
      const debtAmount = '0';

      const { destAmount, logics, error } = await adapter.openByDebt({
        account,
        portfolio,
        zapToken,
        zapAmount,
        collateralToken,
        debtToken,
        debtAmount,
      });

      expect(error).to.be.undefined;
      expect(destAmount).to.eq('0');
      expect(logics).has.length(0);
    });

    it('zero debtAmount', async function () {
      const zapToken = mainnetTokens.USDT;
      const zapAmount = '100';
      const collateralToken = mainnetTokens.ETH;
      const debtToken = mainnetTokens.USDC;
      const debtAmount = '0';

      const { destAmount, error } = await adapter.openByDebt({
        account,
        portfolio,
        zapToken,
        zapAmount,
        collateralToken,
        debtToken,
        debtAmount,
      });

      expect(error).to.be.undefined;
      expect(destAmount).to.eq('0');
    });

    it('success', async function () {
      const zapToken = mainnetTokens.USDT;
      const zapAmount = '1000';
      const collateralToken = mainnetTokens.ETH;
      const debtToken = mainnetTokens.USDC;
      const debtAmount = '100';

      const { destAmount, afterPortfolio, error, logics } = await adapter.openByDebt({
        account,
        portfolio,
        zapToken,
        zapAmount,
        collateralToken,
        debtToken,
        debtAmount,
      });

      expect(error).to.be.undefined;
      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.supply(collateralToken, destAmount);
      expectedAfterPortfolio.borrow(debtToken, logics[5].fields.output.amount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(logics).has.length(7);
      expect(logics[0].rid).to.contain('swap-token');
      expect(logics[1].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[2].rid).to.contain('swap-token');
      expect(logics[3].rid).to.eq('radiant-v2:deposit');
      expect(logics[3].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[4].rid).to.eq('utility:send-token');
      expect(logics[4].fields.recipient).to.eq(account);
      expect(logics[4].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[5].rid).to.eq('radiant-v2:borrow');
      expect(logics[6].rid).to.eq('utility:flash-loan-aggregator');
    });
  });

  context('Test close', function () {
    const blockTag = 20150000;

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(blockTag);
    });

    it('no positions', async function () {
      const account = '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97';
      portfolio = await protocol.getPortfolio(account);

      const withdrawalToken = mainnetTokens.ETH;

      const { destAmount, error, logics } = await adapter.close({ account, portfolio, withdrawalToken });

      expect(error).to.be.undefined;
      expect(destAmount).to.be.eq('0');
      expect(logics).has.length(0);
    });

    it('success', async function () {
      const account = '0xBBaCb7F97BA96aa90E5603CFb47EaE09517C8731';
      portfolio = await protocol.getPortfolio(account);

      const withdrawalToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.close({
        account,
        portfolio,
        withdrawalToken,
      });

      expect(error).to.be.undefined;
      expect(Number(destAmount)).to.be.greaterThan(0);
      expect(afterPortfolio.totalBorrowUSD).to.be.eq(0);
      expect(afterPortfolio.totalSupplyUSD).to.be.eq(0);

      expect(logics).has.length(21);
      expect(logics[0].rid).to.eq('permit2:pull-token');
      expect(logics[1].rid).to.eq('radiant-v2:withdraw');
      expect(logics[1].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[2].rid).to.contain('swap-token');
      expect(logics[3].rid).to.eq('permit2:pull-token');
      expect(logics[4].rid).to.eq('radiant-v2:withdraw');
      expect(logics[4].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[5].rid).to.contain('swap-token');
      expect(logics[6].rid).to.eq('permit2:pull-token');
      expect(logics[7].rid).to.eq('radiant-v2:withdraw');
      expect(logics[7].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[8].rid).to.eq('permit2:pull-token');
      expect(logics[9].rid).to.eq('radiant-v2:withdraw');
      expect(logics[9].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[10].rid).to.contain('swap-token');
      expect(logics[11].rid).to.eq('permit2:pull-token');
      expect(logics[12].rid).to.eq('radiant-v2:withdraw');
      expect(logics[12].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[13].rid).to.contain('swap-token');
      expect(logics[14].rid).to.eq('permit2:pull-token');
      expect(logics[15].rid).to.eq('radiant-v2:withdraw');
      expect(logics[15].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[16].rid).to.contain('swap-token');
      expect(logics[17].rid).to.eq('permit2:pull-token');
      expect(logics[18].rid).to.eq('radiant-v2:withdraw');
      expect(logics[18].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[19].rid).to.contain('swap-token');
      expect(logics[20].rid).to.contain('utility:wrapped-native-token');
    });

    it('success - collateral positions only', async function () {
      const account = '0x28e395a54a64284dba39652921cd99924f4e3797';
      portfolio = await protocol.getPortfolio(account);

      const withdrawalToken = mainnetTokens.USDT;

      const { destAmount, afterPortfolio, error, logics } = await adapter.close({
        account,
        portfolio,
        withdrawalToken,
      });

      expect(error).to.be.undefined;
      expect(Number(destAmount)).to.be.greaterThan(0);
      expect(afterPortfolio.totalSupplyUSD).to.be.eq(0);

      expect(logics).has.length(23);
      expect(logics[0].rid).to.eq('permit2:pull-token');
      expect(logics[1].rid).to.eq('radiant-v2:withdraw');
      expect(logics[1].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[2].rid).to.eq('permit2:pull-token');
      expect(logics[3].rid).to.eq('radiant-v2:withdraw');
      expect(logics[3].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[4].rid).to.contain('swap-token');
      expect(logics[5].rid).to.eq('permit2:pull-token');
      expect(logics[6].rid).to.eq('radiant-v2:withdraw');
      expect(logics[6].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[7].rid).to.contain('swap-token');
      expect(logics[8].rid).to.eq('permit2:pull-token');
      expect(logics[9].rid).to.eq('radiant-v2:withdraw');
      expect(logics[9].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[10].rid).to.contain('swap-token');
      expect(logics[11].rid).to.eq('permit2:pull-token');
      expect(logics[12].rid).to.eq('radiant-v2:withdraw');
      expect(logics[12].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[13].rid).to.contain('swap-token');
      expect(logics[14].rid).to.eq('permit2:pull-token');
      expect(logics[15].rid).to.eq('radiant-v2:withdraw');
      expect(logics[15].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[16].rid).to.contain('swap-token');
      expect(logics[17].rid).to.eq('permit2:pull-token');
      expect(logics[18].rid).to.eq('radiant-v2:withdraw');
      expect(logics[18].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[19].rid).to.contain('swap-token');
      expect(logics[20].rid).to.eq('permit2:pull-token');
      expect(logics[21].rid).to.eq('radiant-v2:withdraw');
      expect(logics[21].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[22].rid).to.contain('swap-token');
    });
  });

  context('Test collateralSwap', function () {
    const account = '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB';

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(blockTag);
      portfolio = await protocol.getPortfolio(account);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '0';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.collateralSwap({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');
      expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(afterPortfolio));
      expect(error).to.be.undefined;
      expect(logics).to.be.empty;
    });

    it('insufficient src collateral balance', async function () {
      const srcToken = mainnetTokens.USDC;
      const destToken = mainnetTokens.ETH;

      const srcCollateral = portfolio.findSupply(srcToken)!;
      const srcAmount = new common.TokenAmount(srcToken, srcCollateral.balance).addWei(1).amount;

      const { destAmount, afterPortfolio, error, logics } = await adapter.collateralSwap({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.withdraw(srcCollateral.token, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error?.name).to.eq('srcAmount');
      expect(error?.code).to.eq('INSUFFICIENT_AMOUNT');
      expect(logics).to.be.empty;
    });

    it('success', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '10';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.collateralSwap({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.withdraw(srcToken, srcAmount);
      expectedAfterPortfolio.supply(destToken, destAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(7);
      expect(logics[0].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[0].fields.protocolId).to.eq('radiant-v2');
      expect(logics[1].rid).to.contain('swap-token');
      expect(logics[2].rid).to.eq('radiant-v2:deposit');
      expect(logics[2].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[3].rid).to.eq('utility:send-token');
      expect(logics[3].fields.recipient).to.eq(account);
      expect(logics[3].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[4].rid).to.eq('permit2:pull-token');
      expect(logics[5].rid).to.eq('radiant-v2:withdraw');
      expect(logics[5].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[6].rid).to.eq('utility:flash-loan-aggregator');
    });
  });

  context('Test debtSwap', function () {
    const account = '0x9edcb464C0AfdD01a5Ffbd09309b437C7dadeAB3';

    let portfolio: Portfolio;

    before(async function () {
      portfolio = await protocol.getPortfolio(account);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '0';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.debtSwap({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');
      expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(afterPortfolio));
      expect(error).to.be.undefined;
      expect(logics).to.be.empty;
    });

    it('insufficient src borrow balance', async function () {
      const srcToken = mainnetTokens.ETH;
      const destToken = mainnetTokens.USDC;

      const srcBorrow = portfolio.findBorrow(srcToken)!;
      const srcAmount = new common.TokenAmount(srcToken, srcBorrow.balance).addWei(1).amount;

      const { destAmount, afterPortfolio, error, logics } = await adapter.debtSwap({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcBorrow.token, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error?.name).to.eq('srcAmount');
      expect(error?.code).to.eq('INSUFFICIENT_AMOUNT');
      expect(logics).to.be.empty;
    });

    it('success', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '100';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.debtSwap({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcToken, srcAmount);
      expectedAfterPortfolio.borrow(destToken, destAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(5);
      expect(logics[0].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[0].fields.protocolId).to.eq('radiant-v2');
      expect(logics[1].rid).to.contain('swap-token');
      expect(logics[2].rid).to.eq('radiant-v2:repay');
      expect(logics[2].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[3].rid).to.eq('radiant-v2:borrow');
      expect(logics[4].rid).to.eq('utility:flash-loan-aggregator');
    });
  });

  context('Test leverageByCollateral', function () {
    const account = '0xBBaCb7F97BA96aa90E5603CFb47EaE09517C8731';

    let portfolio: Portfolio;

    before(async function () {
      portfolio = await protocol.getPortfolio(account);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '0';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.leverageByCollateral({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');
      expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(afterPortfolio));
      expect(error).to.be.undefined;
      expect(logics).to.be.empty;
    });

    it('success - src token is equal to dest token', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '1';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.leverageByCollateral({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.supply(srcToken, srcAmount);
      expectedAfterPortfolio.borrow(destToken, destAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(5);
      expect(logics[0].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[0].fields.protocolId).to.eq('radiant-v2');
      expect(logics[1].rid).to.eq('radiant-v2:deposit');
      expect(logics[1].fields.balanceBps).to.be.undefined;
      expect(logics[2].rid).to.eq('utility:send-token');
      expect(logics[2].fields.recipient).to.eq(account);
      expect(logics[2].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[3].rid).to.eq('radiant-v2:borrow');
      expect(logics[4].rid).to.eq('utility:flash-loan-aggregator');
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '1';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.leverageByCollateral({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.supply(srcToken, logics[2].fields.input.amount);
      expectedAfterPortfolio.borrow(destToken, destAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(6);
      expect(logics[0].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[0].fields.protocolId).to.eq('radiant-v2');
      expect(logics[1].rid).to.contain('swap-token');
      expect(logics[2].rid).to.eq('radiant-v2:deposit');
      expect(logics[2].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[3].rid).to.eq('utility:send-token');
      expect(logics[3].fields.recipient).to.eq(account);
      expect(logics[3].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[4].rid).to.eq('radiant-v2:borrow');
      expect(logics[5].rid).to.eq('utility:flash-loan-aggregator');
    });
  });

  context('Test leverageByDebt', function () {
    const account = '0xBBaCb7F97BA96aa90E5603CFb47EaE09517C8731';

    let portfolio: Portfolio;

    before(async function () {
      portfolio = await protocol.getPortfolio(account);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '0';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.leverageByDebt({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');
      expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(afterPortfolio));
      expect(error).to.be.undefined;
      expect(logics).to.be.empty;
    });

    it('success - src token is equal to dest token', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '1';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.leverageByDebt({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.supply(destToken, destAmount);
      expectedAfterPortfolio.borrow(srcToken, logics[3].fields.output.amount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(5);
      expect(logics[0].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[0].fields.protocolId).to.eq('radiant-v2');
      expect(logics[1].rid).to.eq('radiant-v2:deposit');
      expect(logics[1].fields.balanceBps).to.be.undefined;
      expect(logics[2].rid).to.eq('utility:send-token');
      expect(logics[2].fields.recipient).to.eq(account);
      expect(logics[2].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[3].rid).to.eq('radiant-v2:borrow');
      expect(logics[4].rid).to.eq('utility:flash-loan-aggregator');
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '1';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.leverageByDebt({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.supply(destToken, destAmount);
      expectedAfterPortfolio.borrow(srcToken, logics[4].fields.output.amount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(6);
      expect(logics[0].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[0].fields.protocolId).to.eq('radiant-v2');
      expect(logics[1].rid).to.contain('swap-token');
      expect(logics[2].rid).to.eq('radiant-v2:deposit');
      expect(logics[2].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[3].rid).to.eq('utility:send-token');
      expect(logics[3].fields.recipient).to.eq(account);
      expect(logics[3].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[4].rid).to.eq('radiant-v2:borrow');
      expect(logics[5].rid).to.eq('utility:flash-loan-aggregator');
    });
  });

  context('Test deleverage', function () {
    const account = '0xEb4536003241348012A40470ba86934d141a7342';

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(20150000);
      portfolio = await protocol.getPortfolio(account);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '0';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.deleverage({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');
      expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(afterPortfolio));
      expect(error).to.be.undefined;
      expect(logics).to.be.empty;
    });

    it('insufficient src borrow balance', async function () {
      const srcToken = mainnetTokens.ETH;
      const destToken = mainnetTokens.USDC;

      const srcBorrow = portfolio.findBorrow(srcToken)!;
      const srcAmount = new common.TokenAmount(srcToken, srcBorrow.balance).addWei(1).amount;

      const { destAmount, afterPortfolio, error, logics } = await adapter.deleverage({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcBorrow.token, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error?.name).to.eq('srcAmount');
      expect(error?.code).to.eq('INSUFFICIENT_AMOUNT');
      expect(logics).to.be.empty;
    });

    it('insufficient dest collateral balance', async function () {
      const srcToken = mainnetTokens.wstETH;
      const destToken = mainnetTokens.USDC;

      const destCollateral = portfolio.findSupply(destToken)!;
      const srcAmount = new common.TokenAmount(srcToken, '90').amount;

      const { destAmount, afterPortfolio, error, logics } = await adapter.deleverage({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcToken, srcAmount);
      expectedAfterPortfolio.withdraw(destCollateral.token, destAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error?.name).to.eq('destAmount');
      expect(error?.code).to.eq('INSUFFICIENT_AMOUNT');
      expect(logics).to.be.empty;
    });

    it('success - src token is equal to dest token', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '100';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.deleverage({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcToken, srcAmount);
      expectedAfterPortfolio.withdraw(destToken, destAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(5);
      expect(logics[0].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[0].fields.protocolId).to.eq('radiant-v2');
      expect(logics[1].rid).to.eq('radiant-v2:repay');
      expect(logics[1].fields.balanceBps).to.be.undefined;
      expect(logics[2].rid).to.eq('permit2:pull-token');
      expect(logics[3].rid).to.eq('radiant-v2:withdraw');
      expect(logics[3].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[4].rid).to.eq('utility:flash-loan-aggregator');
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '1';
      const destToken = mainnetTokens.WBTC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.deleverage({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcToken, srcAmount);
      expectedAfterPortfolio.withdraw(destToken, destAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(6);
      expect(logics[0].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[0].fields.protocolId).to.eq('radiant-v2');
      expect(logics[1].rid).to.contain('swap-token');
      expect(logics[2].rid).to.eq('radiant-v2:repay');
      expect(logics[2].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[3].rid).to.eq('permit2:pull-token');
      expect(logics[4].rid).to.eq('radiant-v2:withdraw');
      expect(logics[4].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[5].rid).to.eq('utility:flash-loan-aggregator');
    });
  });

  context('Test zapSupply', function () {
    const account = '0xBBaCb7F97BA96aa90E5603CFb47EaE09517C8731';

    let portfolio: Portfolio;

    before(async function () {
      portfolio = await protocol.getPortfolio(account);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '0';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapSupply({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');
      expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(afterPortfolio));
      expect(error).to.be.undefined;
      expect(logics).to.be.empty;
    });

    it('success - src token is equal to dest token', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '10000';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapSupply({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq(srcAmount);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.supply(srcToken, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(1);
      expect(logics[0].rid).to.eq('radiant-v2:deposit');
      expect(logics[0].fields.balanceBps).to.be.undefined;
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '1';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapSupply({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.supply(destToken, destAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(2);
      expect(logics[0].rid).to.contain('swap-token');
      expect(logics[1].rid).to.eq('radiant-v2:deposit');
      expect(logics[1].fields.balanceBps).to.eq(common.BPS_BASE);
    });
  });

  context('Test zapWithdraw', function () {
    const account = '0x9edcb464C0AfdD01a5Ffbd09309b437C7dadeAB3';

    let portfolio: Portfolio;

    before(async function () {
      portfolio = await protocol.getPortfolio(account);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '0';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapWithdraw({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');
      expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(afterPortfolio));
      expect(error).to.be.undefined;
      expect(logics).to.be.empty;
    });

    it('insufficient src collateral balance', async function () {
      const srcToken = mainnetTokens.WBTC;
      const destToken = mainnetTokens.ETH;

      const srcCollateral = portfolio.findSupply(srcToken)!;
      const srcAmount = new common.TokenAmount(srcToken, srcCollateral.balance).addWei(1).amount;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapWithdraw({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.withdraw(srcCollateral.token, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error?.name).to.eq('srcAmount');
      expect(error?.code).to.eq('INSUFFICIENT_AMOUNT');
      expect(logics).to.be.empty;
    });

    it('success - src token is equal to dest token', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '10000';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapWithdraw({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq(srcAmount);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.withdraw(srcToken, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(1);
      expect(logics[0].rid).to.eq('radiant-v2:withdraw');
      expect(logics[0].fields.balanceBps).to.eq(common.BPS_BASE);
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '10000';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapWithdraw({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.withdraw(srcToken, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(2);
      expect(logics[0].rid).to.eq('radiant-v2:withdraw');
      expect(logics[0].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[1].rid).to.contain('swap-token');
      expect(logics[1].fields.input.amount).to.eq(new common.TokenAmount(srcToken, srcAmount).subWei(3).amount);
    });
  });

  context('Test zapBorrow', function () {
    const account = '0xBBaCb7F97BA96aa90E5603CFb47EaE09517C8731';

    let portfolio: Portfolio;

    before(async function () {
      portfolio = await protocol.getPortfolio(account);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '0';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapBorrow({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');
      expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(afterPortfolio));
      expect(error).to.be.undefined;
      expect(logics).to.be.empty;
    });

    it('success - src token is equal to dest token', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '10000';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapBorrow({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq(srcAmount);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.borrow(srcToken, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(1);
      expect(logics[0].rid).to.eq('radiant-v2:borrow');
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '10000';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapBorrow({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.borrow(srcToken, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(2);
      expect(logics[0].rid).to.eq('radiant-v2:borrow');
      expect(logics[1].rid).to.contain('swap-token');
    });
  });

  context('Test zapRepay', function () {
    const account = '0x9edcb464C0AfdD01a5Ffbd09309b437C7dadeAB3';

    let portfolio: Portfolio;

    before(async function () {
      portfolio = await protocol.getPortfolio(account);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '0';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapRepay({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');
      expect(JSON.stringify(portfolio)).to.eq(JSON.stringify(afterPortfolio));
      expect(error).to.be.undefined;
      expect(logics).to.be.empty;
    });

    it('insufficient src borrow balance', async function () {
      const srcToken = mainnetTokens.ETH;
      const destToken = mainnetTokens.USDC;

      const srcBorrow = portfolio.findBorrow(srcToken)!;
      const srcAmount = new common.TokenAmount(srcToken, srcBorrow.balance).addWei(1).amount;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapRepay({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq('0');

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcBorrow.token, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error?.name).to.eq('srcAmount');
      expect(error?.code).to.eq('INSUFFICIENT_AMOUNT');
      expect(logics).to.be.empty;
    });

    it('success - src token is equal to dest token', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '1';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapRepay({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(destAmount).to.eq(srcAmount);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcToken, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(1);
      expect(logics[0].rid).to.eq('radiant-v2:repay');
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '1';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapRepay({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcToken, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error).to.be.undefined;

      expect(logics).has.length(2);
      expect(logics[0].rid).to.contain('swap-token');
      expect(logics[1].rid).to.eq('radiant-v2:repay');
      expect(logics[1].fields.balanceBps).to.eq(common.BPS_BASE);
    });
  });
});
