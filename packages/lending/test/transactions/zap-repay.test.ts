import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as apisdk from '@protocolink/api';
import { claimToken, getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Zap Repay', function () {
  const chainId = 1;
  const permit2Type = 'approve';

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;
  let service: logics.compoundv3.Service | logics.morphoblue.Service;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);

    await claimToken(chainId, '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0x06e4Cb4f3ba9A2916B6384aCbdeAa74dAAF91550', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0x53fb0162bC8d5EEc2fB1532923C4f8997BAce111', mainnetTokens.USDT, '2000');
    await claimToken(chainId, '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB', mainnetTokens.USDT, '2000');
  });

  snapshotAndRevertEach();

  context('Test ZapRepay', function () {
    const testCases = [
      // {
      //   // TODO: expect(borrowDifference.gte(minRepayAmount)).to.be.true = false;
      //   // skip for now: poisition too big result in debt grows too fast
      //   protocolId: 'aave-v2',
      //   marketId: 'mainnet',
      //   account: '0x7F67F6A09bcb2159b094B64B4acc53D5193AEa2E',
      //   srcToken: mainnetTokens.USDC,
      //   srcAmount: '1000',
      //   srcDebtToken: '0x619beb58998eD2278e08620f97007e1116D5D25b', // variableDebtUSDC
      //   destToken: mainnetTokens.USDT,
      //   expects: {
      //     approvalLength: 2,
      //     logicLength: 2,
      //   },
      // },
      {
        protocolId: 'radiant-v2',
        marketId: 'mainnet',
        account: '0xaf0FDd39e5D92499B0eD9F68693DA99C0ec1e92e',
        srcToken: mainnetTokens.USDC,
        srcAmount: '1000',
        srcDebtToken: '0x490726291F6434646FEb2eC96d2Cc566b18a122F', // vdUSDC
        destToken: mainnetTokens.USDT,
        expects: {
          approvalLength: 2,
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
        destToken: mainnetTokens.USDT,
        expects: {
          approvalLength: 2,
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
        logicService: logics.compoundv3.Service,
        expects: {
          approvalLength: 2,
          logicLength: 2,
        },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        srcToken: mainnetTokens.USDC,
        srcAmount: '0.1',
        srcDebtToken: undefined,
        destToken: mainnetTokens.USDT,
        logicService: logics.morphoblue.Service,
        expects: {
          approvalLength: 2,
          logicLength: 2,
        },
      },
    ];

    testCases.forEach(
      ({ account, protocolId, marketId, srcToken, srcAmount, srcDebtToken, destToken, logicService, expects }, i) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          user = await hre.ethers.getImpersonatedSigner(account);
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

          if (logicService) {
            service = new logicService(chainId, hre.ethers.provider);
          }

          const initBorrowBalance = service
            ? await service.getBorrowBalance(marketId, user.address, srcToken)
            : await getBalance(user.address, srcDebtToken!);

          // 1. user obtains a quotation for zap repay
          const zapRepayInfo = await adapter.zapRepay({
            account,
            portfolio,
            srcToken,
            srcAmount,
            destToken,
          });

          // 2. user needs to allow the Protocolink user agent to repay on behalf of the user
          const estimateResult = await apisdk.estimateRouterData(
            { chainId, account, logics: zapRepayInfo.logics },
            { permit2Type }
          );

          expect(estimateResult.approvals.length).to.eq(expects.approvalLength);
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }

          // 3. user obtains a zap repay transaction request
          expect(zapRepayInfo.logics.length).to.eq(expects.logicLength);
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics: zapRepayInfo.logics,
          });
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          // 4. user's borrow balance should decrease
          // 4-1. debt grows when the block of getting api data is different from the block of executing tx
          const borrowBalance = service
            ? await service.getBorrowBalance(marketId, user.address, srcToken)
            : await getBalance(user.address, srcDebtToken!);
          const repayAmount = new common.TokenAmount(srcToken, srcAmount);
          const borrowDifference = initBorrowBalance.clone().sub(borrowBalance);

          const [minRepay] = utils.bpsBound(repayAmount.amount, 100);
          const minRepayAmount = repayAmount.clone().set(minRepay);
          expect(borrowDifference.gte(minRepayAmount)).to.be.true;
          expect(borrowDifference.lte(repayAmount)).to.be.true;

          // 6. user's dest token balance should decrease
          await expect(user.address).to.changeBalance(destToken, -zapRepayInfo.destAmount);
        });
      }
    );
  });
});
