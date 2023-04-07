import * as common from '@furucombo/composable-router-common';
import { getBalance } from '../utils';

export function supportChangeBalance(Assertion: Chai.AssertionStatic, utils: Chai.ChaiUtils) {
  Assertion.addMethod(
    'changeBalance',
    function (this: any, tokenOrAddress: common.TokenOrAddress, expectedBalanceChange: string, slippage?: number) {
      const promise = getBalances(utils.flag(this, 'object'), tokenOrAddress).then(({ before, after }) => {
        const balanceChange = after.amountWei.sub(before.amountWei);
        let expectedBalanceChangeWei = common.toSmallUnit(expectedBalanceChange, before.token.decimals);
        if (slippage !== undefined) {
          expectedBalanceChangeWei = common.calcSlippage(expectedBalanceChangeWei, slippage);
          if (balanceChange.isNegative()) {
            new Assertion(balanceChange).to.lte(expectedBalanceChangeWei);
          } else {
            new Assertion(balanceChange).to.gte(expectedBalanceChangeWei);
          }
        } else {
          new Assertion(balanceChange).to.eq(expectedBalanceChangeWei);
        }
      });
      this.then = promise.then.bind(promise);
      this.catch = promise.then.bind(promise);

      return this;
    }
  );
}

async function getBalances(account: string, tokenOrAddress: common.TokenOrAddress) {
  const hre = await import('hardhat');
  const blockNumber = await hre.ethers.provider.getBlockNumber();
  const before = await getBalance(account, tokenOrAddress, blockNumber - 1);
  const after = await getBalance(account, tokenOrAddress, blockNumber);

  return { before, after };
}
