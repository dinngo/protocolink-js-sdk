import { Adapter } from 'src/adapter';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import { claimToken, getBalance, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as compoundV3 from 'src/protocols/compound-v3/tokens';
import { expect } from 'chai';
import hre from 'hardhat';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';

describe('Transaction: Zap Supply', function () {
  let user: SignerWithAddress;
  let adapter: Adapter;

  const chainId = 1;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, aaveV3.mainnetTokens.USDC, '2');
    await claimToken(chainId, user.address, aaveV3.mainnetTokens.WETH, '0.4');
  });

  snapshotAndRevertEach();

  context('Test Zap Supply', function () {
    const testCases = [
      {
        skip: false,
        protocolId: 'radiantv2',
        marketId: 'mainnet',
        params: {
          srcToken: radiantV2.mainnetTokens.USDC,
          srcAmount: '1',
          destToken: radiantV2.mainnetTokens.WBTC,
        },
        expects: {
          funds: [radiantV2.mainnetTokens.USDC],
          balances: [radiantV2.mainnetTokens.rWBTC],
          apporveTimes: 2,
          recieves: [radiantV2.mainnetTokens.rWBTC],
        },
      },
      {
        skip: false,
        protocolId: 'aavev3',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV3.mainnetTokens.USDC,
          srcAmount: '1',
          destToken: aaveV3.mainnetTokens.WBTC,
        },
        expects: {
          funds: [aaveV3.mainnetTokens.USDC],
          balances: [aaveV3.mainnetTokens.aEthWBTC],
          apporveTimes: 2,
          recieves: [aaveV3.mainnetTokens.aEthWBTC],
        },
      },
      {
        skip: false,
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.WETH,
          srcAmount: '0.1',
          destToken: compoundV3.mainnetTokens.USDC,
        },
        expects: {
          funds: [compoundV3.mainnetTokens.WETH],
          balances: [compoundV3.mainnetTokens.cUSDCv3],
          apporveTimes: 2,
          recieves: [compoundV3.mainnetTokens.cUSDCv3],
        },
      },
      {
        skip: false,
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.WETH,
          srcAmount: '0.1',
          destToken: compoundV3.mainnetTokens.WBTC,
        },
        expects: {
          funds: [compoundV3.mainnetTokens.WETH],
          balances: [],
          apporveTimes: 2,
          recieves: [],
        },
      },
      {
        skip: false,
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: compoundV3.mainnetTokens.WETH,
          srcAmount: '0.1',
          destToken: compoundV3.mainnetTokens.WETH,
        },
        expects: {
          funds: [compoundV3.mainnetTokens.WETH],
          balances: [],
          apporveTimes: 2,
          recieves: [],
        },
      },
      {
        skip: false,
        protocolId: 'compoundv3',
        marketId: 'ETH',
        params: {
          srcToken: compoundV3.mainnetTokens.WETH,
          srcAmount: '0.1',
          destToken: compoundV3.mainnetTokens.WETH,
        },
        expects: {
          funds: [compoundV3.mainnetTokens.WETH],
          balances: [compoundV3.mainnetTokens.cWETHv3],
          apporveTimes: 2,
          recieves: [compoundV3.mainnetTokens.cWETHv3],
        },
      },
      {
        skip: false,
        protocolId: 'aavev2',
        marketId: 'mainnet',
        params: {
          srcToken: aaveV2.mainnetTokens.USDC,
          srcAmount: '1',
          destToken: aaveV2.mainnetTokens.WBTC,
        },
        expects: {
          funds: [aaveV2.mainnetTokens.USDC],
          balances: [aaveV2.mainnetTokens.aWBTC],
          apporveTimes: 2,
          recieves: [aaveV2.mainnetTokens.aWBTC],
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
