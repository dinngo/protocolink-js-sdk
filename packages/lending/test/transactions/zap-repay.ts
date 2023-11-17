import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ZapRepayParams } from 'src/adapter.type';
import * as api from '@protocolink/api';
import { expect } from 'chai';
import hre from 'hardhat';
import { mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';

describe('Transaction: Zap Repay', function () {
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  const chainId = 1;
  const protocolId = 'aavev3';

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    user = await hre.ethers.getImpersonatedSigner('0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550');

    portfolio = await adapter.getPortfolio(user.address, protocolId);
  });

  snapshotAndRevertEach();

  context('Test ZapRepay', function () {
    const testCases: ZapRepayParams[] = [
      {
        srcToken: mainnetTokens.WBTC,
        srcAmount: '0.0001',
        destToken: mainnetTokens.USDC,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const zapRepayInfo = await adapter.getZapRepayQuotationAndLogics(protocolId, params, user.address, portfolio);

        const routerData: api.RouterData = {
          chainId,
          account: user.address,
          logics: zapRepayInfo.logics,
        };

        const estimateResult = await api.estimateRouterData(routerData, 'approve');

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');

        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        const transactionRequest = await api.buildRouterTransactionRequest(routerData);
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');

        const tx = await user.sendTransaction(transactionRequest);

        expect(tx).to.not.be.reverted;
      });
    });
  });
});
