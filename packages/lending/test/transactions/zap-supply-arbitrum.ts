import { Adapter } from 'src/adapter';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getBalance, snapshotAndRevertEach } from '@protocolink/test-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { providers } from 'ethers';
import { arbitrumTokens as radiantV2ArbitrumTokens } from 'src/protocols/radiant-v2/tokens';

describe.skip('Transaction: Zap Supply Arbitrum', function () {
  let user: SignerWithAddress;
  let adapter: Adapter;

  const chainId = 42161;
  const rpcUrl = 'https://node-beta.furucombo.app/arbitrum';
  const provider = new providers.JsonRpcProvider(rpcUrl);

  before(async function () {
    adapter = new Adapter(chainId, provider, { permitType: 'approve' });
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, radiantV2ArbitrumTokens.USDC, '2');
    await claimToken(chainId, user.address, radiantV2ArbitrumTokens.WETH, '0.4');
  });

  snapshotAndRevertEach();

  context('Test Zap Supply', function () {
    const testCases = [
      {
        skip: false,
        protocolId: 'radiantv2',
        marketId: 'arbitrum',
        params: {
          srcToken: radiantV2ArbitrumTokens.USDC,
          srcAmount: '1',
          destToken: radiantV2ArbitrumTokens.WBTC,
        },
        expects: {
          funds: [radiantV2ArbitrumTokens.USDC],
          balances: [radiantV2ArbitrumTokens.rWBTC],
          apporveTimes: 2,
          recieves: [radiantV2ArbitrumTokens.rWBTC],
        },
      },
    ];

    for (const [i, { skip, protocolId, marketId, params, expects }] of testCases.entries()) {
      if (skip) continue;
      it.only(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        const zapDepositInfo = await adapter.getZapSupply(protocolId, marketId, params, user.address);

        const estimateResult = zapDepositInfo.estimateResult;

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.funds).to.have.lengthOf(expects.funds.length);
        expect(estimateResult.balances).to.have.lengthOf(expects.balances.length);
        expect(estimateResult.approvals).to.have.lengthOf(expects.apporveTimes);

        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        const transactionRequest = await zapDepositInfo.buildRouterTransactionRequest();
        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');

        const tx = await user.sendTransaction(transactionRequest);
        expect(tx).to.not.be.reverted;

        for (const recv of expects.recieves) {
          const balance = await getBalance(user.address, recv);
          expect(balance.gt('0')).to.be.true;
        }
      });
    }
  });
});
