import { Adapter } from '../../src/adapter';
import { LendingFlashLoaner } from '../../src/protocols/aave-v3/lending-flashloaner';
import { LendingProtocol } from '../../src/protocols/aave-v3/lending-protocol';
import { LendingSwaper } from '../../src/protocols/paraswap-v5/lending-swaper';
import { Portfolio } from '../../src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';

const debtSwapTestCases: any[] = [
  {
    input: {
      token: mainnetTokens.USDC,
      amount: '1',
    },
    tokenOut: mainnetTokens.USDT,
  },
];

describe.skip('Transaction: Debt Swap', function () {
  Adapter.registerProtocol(LendingProtocol as any);
  Adapter.registerFlashLoaner(LendingFlashLoaner as any);
  Adapter.registerSwaper(LendingSwaper as any);

  const srcToken = mainnetTokens.USDT;
  const srcTokenInitBalance = '5';

  let chainId: number;
  let user: SignerWithAddress;
  let account: string;

  const adapter = new Adapter(1, hre.ethers.provider);
  const protocolId = 'aavev3';

  let portfolio: Portfolio;

  before(async function () {
    [, user] = await hre.ethers.getSigners();
    account = user.address;

    const portfolios = await adapter.getPortfolios(account);
    console.log('portfolios', portfolios);
    portfolio = portfolios.find((portfolio) => portfolio.protocolId === protocolId)!;
  });

  snapshotAndRevertEach();

  context('Test DebtSwap', function () {
    debtSwapTestCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const debtSwapInfo = await adapter.getDebtSwapQuotationAndLogics(protocolId, params, account, portfolio);

        expect(debtSwapInfo).to.include.all.keys('field', 'logics');
        expect(parseFloat(debtSwapInfo.fields.destAmount)).above(0);
        expect(debtSwapInfo.logics).to.have.lengthOf(5);
      });
    });
  });
});
