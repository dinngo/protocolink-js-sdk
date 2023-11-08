import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ZapWithdrawParams } from 'src/adapter.type';
import * as api from '@protocolink/api';
import { claimToken, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import { expect } from 'chai';
import hre from 'hardhat';

describe('Transaction: Zap Withdraw', function () {
  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  const chainId = 1;
  const protocolId = 'aavev3';
  const testCases: ZapWithdrawParams[] = [
    {
      srcToken: mainnetTokens.WBTC,
      srcAmount: '0.0001',
      destToken: mainnetTokens.USDC,
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

    await claimToken(chainId, user.address, mainnetTokens.WBTC, '1');
  });

  snapshotAndRevertEach();

  context('Test ZapWithdraw', function () {
    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {});
    });
  });
});
