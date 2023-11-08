import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ZapSupplyParams } from 'src/adapter.type';
import * as api from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import { expect } from 'chai';
import hre from 'hardhat';

describe('Transaction: Zap Supply', function () {
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  const chainId = 1;
  const protocolId = 'aavev3';
  const testCases: ZapSupplyParams[] = [
    {
      srcToken: mainnetTokens.USDC,
      srcAmount: '1',
      destToken: mainnetTokens.WBTC,
    },
  ];
  const aEthWBTC = {
    chainId: 1,
    address: '0x5Ee5bf7ae06D1Be5997A1A72006FE6C607eC6DE8',
    decimals: 8,
    symbol: 'aEthWBTC',
    name: 'Aave Ethereum WBTC',
  };

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, mainnetTokens.USDC, '100');
    const portfolio = await adapter.getPortfolio(user.address, protocolId);
    console.log('portfolios', portfolio);
  });

  snapshotAndRevertEach();

  context('Test ZapSupply', function () {
    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const zapDepositInfo = await adapter.getZapSupplyQuotationAndLogics(
          protocolId,
          params,
          user.address,
          portfolio
        );

        const routerData: api.RouterData = {
          chainId,
          account: user.address,
          logics: zapDepositInfo.logics,
        };

        const estimateResult = await api.estimateRouterData(routerData, 'approve');

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.funds).to.have.lengthOf(1);
        expect(estimateResult.funds.get(mainnetTokens.USDC).amount).to.be.eq('1');
        expect(estimateResult.balances).to.have.lengthOf(1);
        expect(estimateResult.balances.get(aEthWBTC).amount).to.be.eq(zapDepositInfo.fields.destAmount);
        expect(estimateResult.approvals).to.have.lengthOf(2);

        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        console.log('routerData', routerData);

        const transactionRequest = await api.buildRouterTransactionRequest(routerData);
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
        console.log('transactionRequest', transactionRequest);

        const tx = await user.sendTransaction(transactionRequest);
        console.log('tx', tx);
        expect(tx).to.not.be.reverted;

        const portfolios = await adapter.getPortfolios(user.address);
        console.log('after-portfolios', portfolios);
      });
    });
  });
});
