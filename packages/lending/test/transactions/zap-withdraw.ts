import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import hre from 'hardhat';
import { mainnetTokens } from '@protocolink/test-helpers';

describe('Transaction: Zap Withdraw', function () {
  const chainId = 1;
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider, { permitType: 'approve' });
  });

  context('Test ZapWithdraw', function () {
    const aEthWBTC = {
      chainId: 1,
      address: '0x5Ee5bf7ae06D1Be5997A1A72006FE6C607eC6DE8',
      decimals: 8,
      symbol: 'aEthWBTC',
      name: 'Aave Ethereum WBTC',
    };
    const cETH = {
      chainId: 1,
      address: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
      decimals: 18,
      symbol: 'cETHv3',
      name: 'Compound ETH',
    };

    const testCases = [
      {
        skip: false,
        testingAccount: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        protocolId: 'aavev3',
        marketId: 'mainnet',
        params: {
          srcToken: mainnetTokens.WBTC,
          srcAmount: '0.0001',
          destToken: mainnetTokens.USDC,
        },
        expects: {
          funds: [aEthWBTC],
          balances: [mainnetTokens.USDC],
          apporveTimes: 2,
          recieves: [mainnetTokens.USDC],
        },
      },
      {
        skip: false,
        testingAccount: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        protocolId: 'compoundv3',
        marketId: 'ETH',
        params: {
          srcToken: mainnetTokens.ETH,
          srcAmount: '100',
          destToken: mainnetTokens.USDC,
        },
        expects: {
          funds: [cETH],
          balances: [mainnetTokens.USDC],
          apporveTimes: 2,
          recieves: [mainnetTokens.USDC],
        },
      },
      {
        testingAccount: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: mainnetTokens.ETH,
          srcAmount: '0.0025',
          destToken: mainnetTokens.USDC,
        },
        expects: {
          funds: [],
          balances: [mainnetTokens.USDC],
          apporveTimes: 1,
          recieves: [mainnetTokens.USDC],
        },
      },
      {
        testingAccount: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        protocolId: 'compoundv3',
        marketId: 'USDC',
        params: {
          srcToken: mainnetTokens.ETH,
          srcAmount: '0.0025',
          destToken: mainnetTokens.ETH,
        },
        expects: {
          funds: [],
          balances: [mainnetTokens.USDC],
          apporveTimes: 1,
          recieves: [mainnetTokens.ETH],
        },
      },
    ];

    for (const [i, { skip, testingAccount, protocolId, marketId, params, expects }] of testCases.entries()) {
      if (skip) continue;
      it.only(`case ${i + 1}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(testingAccount);

        const zapWithdrawInfo = await adapter.getZapWithdraw(protocolId, marketId, params, user.address, portfolio);

        const estimateResult = await zapWithdrawInfo.estimateResult;

        expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals');
        expect(estimateResult.funds).to.have.lengthOf(expects.funds.length);
        expect(estimateResult.balances).to.have.lengthOf(expects.balances.length);
        expect(estimateResult.approvals).to.have.lengthOf(expects.apporveTimes);
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        const transactionRequest = await zapWithdrawInfo.buildRouterTransactionRequest();

        expect(transactionRequest).to.include.all.keys('to', 'data', 'value');

        const tx = await user.sendTransaction(transactionRequest);
        expect(tx).to.not.be.reverted;
      });
    }
  });
});
