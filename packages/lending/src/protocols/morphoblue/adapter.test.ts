import { Adapter } from 'src/adapter';
import { ID } from './configs';
import { LendingProtocol } from './lending-protocol';
import { Portfolio } from 'src/protocol.portfolio';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('Test Adapter for Morpho Blue', async function () {
  const chainId = common.ChainId.mainnet;
  const blockTag = 18982784;
  const marketId = '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc';
  let adapter: Adapter;
  let protocol: LendingProtocol;

  before(async function () {
    adapter = await Adapter.createAdapter(chainId);
    protocol = adapter.protocolMap[ID] as LendingProtocol;
    protocol.setBlockTag(blockTag);
  });

  context('Test openByCollateral', function () {
    const account = '0x9cbf099ff424979439dfba03f00b5961784c06ce';
    const blockTag = 19167450;

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(blockTag);
      portfolio = await protocol.getPortfolio(account, marketId);
    });

    it('zero zapAmount', async function () {
      const zapToken = mainnetTokens.ETH;
      const zapAmount = '0';
      const collateralToken = mainnetTokens.wstETH;
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
      const zapToken = mainnetTokens.ETH;
      const zapAmount = '1';
      const collateralToken = mainnetTokens.wstETH;
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
      const zapToken = mainnetTokens.ETH;
      const zapAmount = '1';
      const collateralToken = mainnetTokens.wstETH;
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

      expect(logics).has.length(6);
      expect(logics[0].rid).to.contain('swap-token');
      expect(logics[1].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[2].rid).to.contain('swap-token');
      expect(logics[3].rid).to.eq('morphoblue:supply-collateral');
      expect(logics[3].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[4].rid).to.eq('morphoblue:borrow');
      expect(logics[5].rid).to.eq('utility:flash-loan-aggregator');
    });
  });

  context('Test openByDebt', function () {
    const account = '0x9cbf099ff424979439dfba03f00b5961784c06ce';
    const blockTag = 19167450;

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(blockTag);
      portfolio = await protocol.getPortfolio(account, marketId);
    });

    it('zero zapAmount', async function () {
      const zapToken = mainnetTokens.ETH;
      const zapAmount = '0';
      const collateralToken = mainnetTokens.wstETH;
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
      const zapToken = mainnetTokens.ETH;
      const zapAmount = '1';
      const collateralToken = mainnetTokens.wstETH;
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
      const zapToken = mainnetTokens.ETH;
      const zapAmount = '1';
      const collateralToken = mainnetTokens.wstETH;
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
      expectedAfterPortfolio.borrow(debtToken, logics[4].fields.output.amount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(logics).has.length(6);
      expect(logics[0].rid).to.contain('swap-token');
      expect(logics[1].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[2].rid).to.contain('swap-token');
      expect(logics[3].rid).to.eq('morphoblue:supply-collateral');
      expect(logics[3].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[4].rid).to.eq('morphoblue:borrow');
      expect(logics[5].rid).to.eq('utility:flash-loan-aggregator');
    });
  });

  context('Test close', function () {
    const blockTag = 19167450;

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(blockTag);
    });

    it('no positions', async function () {
      const account = '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97';
      portfolio = await protocol.getPortfolio(account, marketId);

      const withdrawalToken = mainnetTokens.ETH;

      const { destAmount, error, logics } = await adapter.close({ account, portfolio, withdrawalToken });

      expect(error).to.be.undefined;
      expect(destAmount).to.be.eq('0');
      expect(logics).has.length(0);
    });

    it('success', async function () {
      const account = '0x9cbf099ff424979439dfba03f00b5961784c06ce';
      portfolio = await protocol.getPortfolio(account, marketId);

      const withdrawalToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.close({
        account,
        portfolio,
        withdrawalToken,
      });

      expect(error).to.be.undefined;
      expect(Number(destAmount)).to.be.greaterThan(0);
      expect(afterPortfolio.totalBorrowUSD).to.be.eq(0);
      expect(afterPortfolio.totalSupplyUSD).to.be.eq(0);

      expect(logics).has.length(5);
      expect(logics[0].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[1].rid).to.eq('morphoblue:repay');
      expect(logics[1].fields.balanceBps).to.be.undefined;
      expect(logics[2].rid).to.eq('morphoblue:withdraw-collateral');
      expect(logics[3].rid).to.contain('swap-token');
      expect(logics[4].rid).to.eq('utility:flash-loan-aggregator');
    });

    it('success - collateral positions only', async function () {
      const account = '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB';
      portfolio = await protocol.getPortfolio(account, marketId);

      const withdrawalToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.close({
        account,
        portfolio,
        withdrawalToken,
      });

      expect(error).to.be.undefined;
      expect(Number(destAmount)).to.be.greaterThan(0);
      expect(afterPortfolio.totalSupplyUSD).to.be.eq(0);

      expect(logics).has.length(2);
      expect(logics[0].rid).to.eq('morphoblue:withdraw-collateral');
      expect(logics[1].rid).to.contain('swap-token');
    });
  });

  // Morpho blue - only one collateral token and one debt token
  // leverage only have one scenario - leverage by collateral token
  context('Test leverageByCollateral', function () {
    const account = '0x9edcb464C0AfdD01a5Ffbd09309b437C7dadeAB3';
    const blockTag = 20180000;

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(blockTag);
      portfolio = await protocol.getPortfolio(account, marketId);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.wstETH;
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

    it('src token is not collateral token', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '0.001';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.leverageByCollateral({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.eq(0);

      expect(JSON.stringify(portfolio.clone())).to.eq(JSON.stringify(afterPortfolio));

      expect(error?.name).to.eq('srcAmount');
      expect(error?.code).to.eq('UNSUPPORTED_TOKEN');
      expect(logics).has.length(0);
    });

    it('dest token is not debt token', async function () {
      const srcToken = mainnetTokens.wstETH;
      const srcAmount = '0.001';
      const destToken = mainnetTokens.ETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.leverageByCollateral({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.eq(0);

      expect(JSON.stringify(portfolio.clone())).to.eq(JSON.stringify(afterPortfolio));

      expect(error?.name).to.eq('destAmount');
      expect(error?.code).to.eq('UNSUPPORTED_TOKEN');
      expect(logics).has.length(0);
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.wstETH;
      const srcAmount = '0.1';
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

      expect(logics).has.length(5);
      expect(logics[0].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[1].rid).to.contain('swap-token');
      expect(logics[2].rid).to.eq('morphoblue:supply-collateral');
      expect(logics[2].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[3].rid).to.eq('morphoblue:borrow');
      expect(logics[4].rid).to.eq('utility:flash-loan-aggregator');
    });
  });

  context('Test deleverage', function () {
    const blockTag = 19232405;

    const account = '0x4AAB5CbFe493fc2AC18C46A68eF42c58ba06C9BD';
    const marketId = '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41';

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(blockTag);
      portfolio = await protocol.getPortfolio(account, marketId);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.WETH;
      const srcAmount = '0';
      const destToken = mainnetTokens.wstETH;

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
      const srcToken = mainnetTokens.WETH;
      const destToken = mainnetTokens.wstETH;

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
      const srcToken = mainnetTokens.WETH;
      const destToken = mainnetTokens.wstETH;
      const srcAmount = '10000';

      const { destAmount, afterPortfolio, error, logics } = await adapter.deleverage({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.eq(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcToken, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(error?.name).to.eq('srcAmount');
      expect(error?.code).to.eq('INSUFFICIENT_AMOUNT');
      expect(logics).to.be.empty;
    });

    it('src token is not debt token', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '10000';
      const destToken = mainnetTokens.wstETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.deleverage({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.eq(0);

      expect(JSON.stringify(portfolio.clone())).to.eq(JSON.stringify(afterPortfolio));

      expect(error?.name).to.eq('srcAmount');
      expect(error?.code).to.eq('UNSUPPORTED_TOKEN');
      expect(logics).has.length(0);
    });

    it('dest token is not collateral token', async function () {
      const srcToken = mainnetTokens.WETH;
      const srcAmount = '10000';
      const destToken = mainnetTokens.USDC;

      const { destAmount, afterPortfolio, error, logics } = await adapter.deleverage({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(Number(destAmount)).to.eq(0);

      expect(JSON.stringify(portfolio.clone())).to.eq(JSON.stringify(afterPortfolio));

      expect(error?.name).to.eq('destAmount');
      expect(error?.code).to.eq('UNSUPPORTED_TOKEN');
      expect(logics).has.length(0);
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.WETH;
      const srcAmount = '0.01';
      const destToken = mainnetTokens.wstETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.deleverage({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(error).to.be.undefined;
      expect(Number(destAmount)).to.be.greaterThan(0);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcToken, srcAmount);
      expectedAfterPortfolio.withdraw(destToken, destAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(logics).has.length(5);
      expect(logics[0].rid).to.eq('utility:flash-loan-aggregator');
      expect(logics[1].rid).to.contain('swap-token');
      expect(logics[2].rid).to.eq('morphoblue:repay');
      expect(logics[2].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[3].rid).to.eq('morphoblue:withdraw-collateral');
      expect(logics[4].rid).to.eq('utility:flash-loan-aggregator');
    });
  });

  context('Test zapSupply', function () {
    const account = '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB';

    let portfolio: Portfolio;

    before(async function () {
      portfolio = await protocol.getPortfolio(account, marketId);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '0';
      const destToken = mainnetTokens.wstETH;

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

    it('src token is equal to dest token', async function () {
      const srcToken = mainnetTokens.wstETH;
      const srcAmount = '10';
      const destToken = mainnetTokens.wstETH;

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
      expect(logics[0].rid).to.eq('morphoblue:supply-collateral');
      expect(logics[0].fields.balanceBps).to.be.undefined;
    });

    it('src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '1';
      const destToken = mainnetTokens.wstETH;

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
      expect(logics[1].rid).to.eq('morphoblue:supply-collateral');
      expect(logics[1].fields.balanceBps).to.eq(common.BPS_BASE);
    });
  });

  context('Test zapWithdraw', function () {
    const blockTag = 19232405;

    const account = '0x4AAB5CbFe493fc2AC18C46A68eF42c58ba06C9BD';
    const marketId = '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41';

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(blockTag);
      portfolio = await protocol.getPortfolio(account, marketId);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.wstETH;
      const srcAmount = '0';
      const destToken = mainnetTokens.USDC;

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
      const srcToken = mainnetTokens.wstETH;
      const destToken = mainnetTokens.USDC;

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
      const srcToken = mainnetTokens.wstETH;
      const srcAmount = '0.005';
      const destToken = mainnetTokens.wstETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapWithdraw({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(error).to.be.undefined;
      expect(destAmount).to.eq(srcAmount);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.withdraw(srcToken, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(logics).has.length(1);
      expect(logics[0].rid).to.eq('morphoblue:withdraw-collateral');
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.wstETH;
      const srcAmount = '0.005';
      const destToken = mainnetTokens.USDC;

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
      expect(logics[0].rid).to.eq('morphoblue:withdraw-collateral');
      expect(logics[1].rid).to.contain('swap-token');
      expect(logics[1].fields.input.amount).to.eq(srcAmount);
    });
  });

  context('Test zapBorrow', function () {
    const account = '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB';

    let portfolio: Portfolio;

    before(async function () {
      portfolio = await protocol.getPortfolio(account, marketId);
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
      const srcAmount = '1';
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
      expect(logics[0].rid).to.eq('morphoblue:borrow');
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.USDC;
      const srcAmount = '10';
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
      expect(logics[0].rid).to.eq('morphoblue:borrow');
      expect(logics[1].rid).to.contain('swap-token');
    });
  });

  context('Test zapRepay', function () {
    const blockTag = 19232405;

    const account = '0x4AAB5CbFe493fc2AC18C46A68eF42c58ba06C9BD';
    const marketId = '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41';

    let portfolio: Portfolio;

    before(async function () {
      protocol.setBlockTag(blockTag);
      portfolio = await protocol.getPortfolio(account, marketId);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.WETH;
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
      const srcToken = mainnetTokens.WETH;
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
      const srcToken = mainnetTokens.WETH;
      const srcAmount = '0.01';
      const destToken = mainnetTokens.WETH;

      const { destAmount, afterPortfolio, error, logics } = await adapter.zapRepay({
        account,
        portfolio,
        srcToken,
        srcAmount,
        destToken,
      });

      expect(error).to.be.undefined;
      expect(destAmount).to.eq(srcAmount);

      const expectedAfterPortfolio = portfolio.clone();
      expectedAfterPortfolio.repay(srcToken, srcAmount);
      expect(JSON.stringify(expectedAfterPortfolio)).to.eq(JSON.stringify(afterPortfolio));

      expect(logics).has.length(1);
      expect(logics[0].rid).to.eq('morphoblue:repay');
      expect(logics[0].fields.balanceBps).to.be.undefined;
    });

    it('success - src token is not equal to dest token', async function () {
      const srcToken = mainnetTokens.WETH;
      const srcAmount = '0.01';
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
      expect(logics[1].rid).to.eq('morphoblue:repay');
      expect(logics[1].fields.balanceBps).to.eq(common.BPS_BASE);
    });
  });
});
