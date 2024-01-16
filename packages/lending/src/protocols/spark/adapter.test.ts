import { Adapter } from 'src/adapter';
import { LendingProtocol } from './lending-protocol';
import { Portfolio } from 'src/protocol.portfolio';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('Test Adapter for Spark', function () {
  const chainId = common.ChainId.mainnet;
  const adapter = new Adapter(chainId);

  const protocol = new LendingProtocol(chainId);

  context('Test collateralSwap', function () {
    const account = '0x8bf7058bfe4cf0d1fdfd41f43816c5555c17431d';

    let portfolio: Portfolio;

    before(async function () {
      portfolio = await protocol.getPortfolio(account);
    });

    it('srcAmount = 0', async function () {
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '0';
      const destToken = mainnetTokens.USDC;

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
      const srcToken = mainnetTokens.ETH;
      const destToken = mainnetTokens.USDC;

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
      const srcToken = mainnetTokens.ETH;
      const srcAmount = '1';
      const destToken = mainnetTokens.USDC;

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
      expect(logics[1].rid).to.contain('swap-token');
      expect(logics[2].rid).to.eq('spark:supply');
      expect(logics[2].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[3].rid).to.eq('utility:send-token');
      expect(logics[3].fields.recipient).to.eq(account);
      expect(logics[3].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[4].rid).to.eq('permit2:pull-token');
      expect(logics[5].rid).to.eq('spark:withdraw');
      expect(logics[5].fields.balanceBps).to.eq(common.BPS_BASE);
      expect(logics[6].rid).to.eq('utility:flash-loan-aggregator');
    });
  });
});
