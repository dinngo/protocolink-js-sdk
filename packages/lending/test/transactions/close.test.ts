import { Adapter } from 'src/adapter';
import { Portfolio } from 'src/protocol.portfolio';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aaveV2 from 'src/protocols/aave-v2/tokens';
import * as aaveV3 from 'src/protocols/aave-v3/tokens';
import * as apisdk from '@protocolink/api';
import { claimToken, getBalance, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as logics from '@protocolink/logics';
import * as morphoblue from 'src/protocols/morphoblue/tokens';
import * as radiantV2 from 'src/protocols/radiant-v2/tokens';
import { spark } from '@protocolink/logics';
import * as utils from 'test/utils';

describe('Transaction: Close', function () {
  const chainId = 1;
  const permit2Type = 'approve';

  let portfolio: Portfolio;
  let user: SignerWithAddress;
  let adapter: Adapter;

  before(async function () {
    adapter = new Adapter(chainId, hre.ethers.provider);
    await claimToken(chainId, '0x1490318dd1c926970ed946a35f018196c68cc6c3', mainnetTokens.ETH, '15'); // gas
  });

  snapshotAndRevertEach();

  context('Test Close', function () {
    const testCases = [
      {
        protocolId: 'aave-v2',
        marketId: 'mainnet',
        account: '0x624698bb841f344a200fe6adb695e8ff695bcad7',
        withdrawalToken: mainnetTokens.ETH,
        collateralAccountingToken: aaveV2.mainnetTokens.aWETH,
        variableDebtToken: '0x531842cEbbdD378f8ee36D171d6cC9C4fcf475Ec', // variableDebtUSDT
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'aave-v3',
        marketId: 'mainnet',
        account: '0x1490318dd1c926970ed946a35f018196c68cc6c3',
        withdrawalToken: mainnetTokens.USDT,
        collateralAccountingToken: aaveV3.mainnetTokens.aEthWETH,
        variableDebtToken: '0x72E95b8931767C79bA4EeE721354d6E99a61D004', // variableDebtEthUSDC
        expects: { logicLength: 7 },
      },
      {
        protocolId: 'compound-v3',
        marketId: logics.compoundv3.MarketId.ETH,
        account: '0x4AAB5CbFe493fc2AC18C46A68eF42c58ba06C9BD',
        withdrawalToken: mainnetTokens.USDT,
        collateralAccountingToken: morphoblue.mainnetTokens.wstETH,
        service: new logics.compoundv3.Service(chainId, hre.ethers.provider),
        expects: { logicLength: 6 },
      },
      {
        protocolId: 'morphoblue',
        marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        account: '0x4AAB5CbFe493fc2AC18C46A68eF42c58ba06C9BD',
        withdrawalToken: mainnetTokens.USDT,
        collateralAccountingToken: morphoblue.mainnetTokens.wstETH,
        service: new logics.morphoblue.Service(chainId, hre.ethers.provider),
        expects: { logicLength: 6 },
      },
    ];

    testCases.forEach(
      (
        {
          protocolId,
          marketId,
          account,
          withdrawalToken,
          collateralAccountingToken,
          variableDebtToken,
          service,
          expects,
        },
        i
      ) => {
        it(`case ${i + 1} - ${protocolId}:${marketId}`, async function () {
          user = await hre.ethers.getImpersonatedSigner(account);
          portfolio = await adapter.getPortfolio(user.address, protocolId, marketId);

          const initCollateralBalance = service
            ? await service.getCollateralBalance(marketId, user.address, collateralAccountingToken)
            : await getBalance(user.address, collateralAccountingToken);

          // 1. user obtains a quotation for deleveraging dest token
          const closeInfo = await adapter.close(account, portfolio, withdrawalToken);
          const logics = closeInfo.logics;
          expect(closeInfo.error).to.be.undefined;

          // 2. user needs to permit the Protocolink user agent to borrow on behalf of the user
          const estimateResult = await apisdk.estimateRouterData({ chainId, account, logics }, { permit2Type });
          for (const approval of estimateResult.approvals) {
            await expect(user.sendTransaction(approval)).to.not.be.reverted;
          }

          // 3. user obtains a deleverage transaction request
          expect(logics.length).to.eq(expects.logicLength);
          const transactionRequest = await apisdk.buildRouterTransactionRequest({
            chainId,
            account,
            logics,
          });
          await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

          // 4. user's borrow balance should be zero.
          const borrowBalance = service
            ? await service.getBorrowBalance(marketId, user.address)
            : await getBalance(user.address, variableDebtToken!);
          expect(borrowBalance.amount).to.be.eq('0');

          // 5. user's collateral balance should decrease.
          // 5-1. collateral grows when the block of getting api data is different from the block of executing tx
          const collateralBalance = service
            ? await service.getCollateralBalance(marketId, user.address, collateralAccountingToken)
            : await getBalance(user.address, collateralAccountingToken);
          const withdrawAmount = service
            ? new common.TokenAmount(logics[3].fields.output)
            : new common.TokenAmount(logics[3].fields.input);
          expect(collateralBalance.gte(initCollateralBalance.clone().sub(withdrawAmount.amount))).to.be.true;
        });
      }
    );
  });
});
