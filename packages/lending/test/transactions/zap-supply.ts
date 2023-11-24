import { Adapter } from 'src/adapter';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';

describe('Transaction: Zap Supply', function () {
  let user: SignerWithAddress;
  let adapter: Adapter;

  const chainId = 1;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, mainnetTokens.USDC, '2');
    await claimToken(chainId, user.address, mainnetTokens.WETH, '0.4');
  });

  snapshotAndRevertEach();

  context('Test Zap Supply', function () {
    const aEthWBTC = {
      chainId: 1,
      address: '0x5Ee5bf7ae06D1Be5997A1A72006FE6C607eC6DE8',
      decimals: 8,
      symbol: 'aEthWBTC',
      name: 'Aave Ethereum WBTC',
    };
    const cUSDC = {
      chainId: 1,
      address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
      decimals: 6,
      symbol: 'cUSDCv3',
      name: 'Compound USDC',
    };
    const cWETH = {
      chainId: 1,
      address: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
      decimals: 6,
      symbol: 'cWETHv3',
      name: 'Compound WETH',
    };

    const testCases = [
      {
        skip: false,
        protocolId: 'aavev3',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.USDC,
          srcAmount: '1',
          destToken: mainnetTokens.WBTC,
        },
        expects: {
          funds: [mainnetTokens.USDC],
          balances: [aEthWBTC],
          apporveTimes: 2,
          recieves: [aEthWBTC],
        },
      },
      {
        skip: false,
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: mainnetTokens.WETH,
          srcAmount: '0.1',
          destToken: mainnetTokens.USDC,
        },
        expects: {
          funds: [mainnetTokens.WETH],
          balances: [cUSDC],
          apporveTimes: 2,
          recieves: [cUSDC],
        },
      },
      {
        skip: false,
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: mainnetTokens.WETH,
          srcAmount: '0.1',
          destToken: mainnetTokens.WBTC,
        },
        expects: {
          funds: [mainnetTokens.WETH],
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
          srcToken: mainnetTokens.WETH,
          srcAmount: '0.1',
          destToken: mainnetTokens.WETH,
        },
        expects: {
          funds: [mainnetTokens.WETH],
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
          srcToken: mainnetTokens.WETH,
          srcAmount: '0.1',
          destToken: mainnetTokens.WETH,
        },
        expects: {
          funds: [mainnetTokens.WETH],
          balances: [cWETH],
          apporveTimes: 2,
          recieves: [cWETH],
        },
      },
      {
        skip: false,
        protocolId: 'aavev2',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.USDC,
          srcAmount: '1',
          destToken: mainnetTokens.WBTC,
        },
        expects: {
          funds: [mainnetTokens.USDC],
          balances: [logics.aavev2.mainnetTokens.aWBTC],
          apporveTimes: 2,
          recieves: [logics.aavev2.mainnetTokens.aWBTC],
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
