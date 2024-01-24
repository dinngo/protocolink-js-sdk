import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Zap Borrow', function () {
  const chainId = 1;
  const permit2Type = 'approve';
  const slippage = 100;

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;
  let service: logics.compoundv3.Service | logics.morphoblue.Service;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
  });

  snapshotAndRevertEach();

  context('Test ZapBorrow', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
        srcToken: mainnetTokens.USDC,
        srcAmount: '1000',
        srcDebtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
        destToken: mainnetTokens.USDT,
        expects: {
          logicLength: 2,
        },
      },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0x0E79368B079910b31e71Ce1B2AE510461359128D',
        srcToken: mainnetTokens.USDC,
        srcAmount: '1000',
        srcDebtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
        destToken: mainnetTokens.USDT,
        expects: {
          logicLength: 2,
        },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        account: '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550',
        srcToken: mainnetTokens.USDC,
        srcAmount: '1000',
        srcDebtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
        destToken: mainnetTokens.WBTC,
        expects: {
          logicLength: 2,
        },
      },
      {
        protocolId: 'spark',
        marketId: 'mainnet',
        account: '0x8bf7058bfe4cf0d1fdfd41f43816c5555c17431d',
        srcToken: mainnetTokens.DAI,
        srcAmount: '1000',
        srcDebtToken: '0xf705d2B7e92B3F38e6ae7afaDAA2fEE110fE5914', // DAI_variableDebtToken
        destToken: mainnetTokens.WBTC,
        expects: {
          logicLength: 2,
        },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.USDC,
        account: '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111',
        srcToken: mainnetTokens.USDC,
        srcAmount: '1000',
        destToken: mainnetTokens.USDT,
        expects: {
          logicLength: 2,
        },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        account: '0x9cbf099ff424979439dfba03f00b5961784c06ce',
        srcToken: mainnetTokens.USDC,
        srcAmount: '1000',
        destToken: mainnetTokens.USDT,
        expects: {
          logicLength: 2,
        },
      },
    ];

    testCases.forEach(({ account, protocolId, marketId, srcToken, srcAmount, srcDebtToken, destToken, expects }, i) => {
      it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
        user = await hre.ethers.getImpersonatedSigner(account);
        portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

        if (protocolId === 'compound-v3') {
          service = new logics.compoundv3.Service(chainId, hre.ethers.provider);
        } else if (protocolId === 'morphoblue') {
          service = new logics.morphoblue.Service(chainId, hre.ethers.provider);
        }

        const initBorrowBalance = service
          ? await service.getBorrowBalance(marketId, user.address, srcToken)
          : await getBalance(user.address, srcDebtToken!);

        // 1. user obtains a quotation for zap borrow
        const zapBorrowInfo = await adapter.zapBorrow({
          account,
          portfolio,
          srcToken,
          srcAmount,
          destToken,
        });

        // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
        const estimateResult = await apisdk.estimateRouterData(
          { chainId, account, logics: zapBorrowInfo.logics },
          { permit2Type }
        );
        for (const approval of estimateResult.approvals) {
          await expect(user.sendTransaction(approval)).to.not.be.reverted;
        }

        // 3. user obtains a zap borrow transaction request
        expect(zapBorrowInfo.logics.length).to.eq(expects.logicLength);
        const transactionRequest = await apisdk.buildRouterTransactionRequest({
          chainId,
          account,
          logics: zapBorrowInfo.logics,
        });
        await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

        // 4. user's borrow balance should increase.
        const borrowBalance = service
          ? await service.getBorrowBalance(marketId, user.address, srcToken)
          : await getBalance(user.address, srcDebtToken!);
        const borrowDifference = borrowBalance.clone().sub(initBorrowBalance);
        const borrowAmount = new common.TokenAmount(srcToken, srcAmount);

        // 4-1. debt grows when the block of getting api data is different from the block of executing tx
        const [, maxBorrow] = utils.bpsBound(borrowAmount.amount, 500);
        const maxBorrowAmount = borrowAmount.clone().set(maxBorrow);
        expect(borrowDifference.lte(maxBorrowAmount)).to.be.true;
        expect(borrowDifference.gte(borrowAmount)).to.be.true;

        // 5. user's dest token balance should increase
        // 5-1. rate may change when the block of getting api data is different from the block of executing tx
        await expect(user.address).to.changeBalance(destToken, zapBorrowInfo.destAmount, slippage);
      });
    });
  });
});
