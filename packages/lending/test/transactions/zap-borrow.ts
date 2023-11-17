import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ZapBorrowParams } from 'src/adapter.type';
import * as api from '@protocolink/api';
import { expect } from 'chai';
import hre from 'hardhat';
import { mainnetTokens } from '@protocolink/test-helpers';

describe('Transaction: Zap Borrow', function () {
  const chainId = 1;
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    user = await hre.ethers.getImpersonatedSigner('0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550');
  });

  context('Test ZapBorrow', function () {
    const testCases: ZapBorrowParams[] = [
      {
        srcToken: mainnetTokens.USDC,
        srcAmount: '1',
        destToken: mainnetTokens.WBTC,
      },
    ];
    const protocolId = 'aavev3';

    for (const [i, params] of testCases.entries()) {
      it(`case ${i + 1}`, async function () {
        const zapBorrowInfo = await adapter.getZapBorrowQuotationAndLogics(protocolId, params, user.address, portfolio);

        const routerData: api.RouterData = {
          chainId,
          account: user.address,
          logics: zapBorrowInfo.logics,
        };

        const estimateResult = await api.estimateRouterData(routerData, 'approve');

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.approvals).to.have.lengthOf(1);

        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        const transactionRequest = await api.buildRouterTransactionRequest(routerData);

        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');

        const tx = await user.sendTransaction(transactionRequest);

        expect(tx).to.not.be.reverted;
      });
    }
  });
});
