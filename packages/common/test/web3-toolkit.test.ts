import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { TokenAmount, TokenAmounts, Web3Toolkit, newErc20ApproveTransactionRequest } from 'src';
import { expect } from 'chai';
import { getChainId, snapshotAndRevertEach } from '@furucombo/composable-router-test-helpers';
import hre from 'hardhat';
import { mainnetTokens } from './fixtures/tokens';

describe('Web3Toolkit', function () {
  const spender = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

  let chainId: number;
  let user: SignerWithAddress;
  let web3Toolkit: Web3Toolkit;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    web3Toolkit = new Web3Toolkit(chainId, hre.ethers.provider);
  });

  snapshotAndRevertEach();

  context('Test getBalance()', function () {
    const testCases = [
      {
        account: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
        tokenOrAddress: mainnetTokens.ETH,
        blockTag: 16923000,
        expected: '584999.075061347770335037',
      },
      {
        account: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
        tokenOrAddress: mainnetTokens.USDC.toObject(),
        blockTag: 16923000,
        expected: '772999999.84',
      },
      {
        account: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
        tokenOrAddress: mainnetTokens.DAI.address,
        blockTag: 16923000,
        expected: '64499972',
      },
    ];

    testCases.forEach(({ account, tokenOrAddress, blockTag, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        const balance = await web3Toolkit.getBalance(account, tokenOrAddress, blockTag);
        expect(balance.amount).to.eq(expected);
      });
    });
  });

  context('Test getAllowance()', function () {
    const testCases = [
      { tokenAmount: new TokenAmount(mainnetTokens.WETH, '1') },
      { tokenAmount: new TokenAmount(mainnetTokens.USDC, '2') },
      { tokenAmount: new TokenAmount(mainnetTokens.USDT, '3') },
    ];

    testCases.forEach(({ tokenAmount }, i) => {
      it(`case ${i + 1}`, async function () {
        let allowance = await web3Toolkit.getAllowance(user.address, tokenAmount.token, spender);
        expect(allowance).to.eq(0);

        const approveTransactionRequest = newErc20ApproveTransactionRequest(
          tokenAmount.token,
          spender,
          tokenAmount.amountWei
        );
        await expect(user.sendTransaction(approveTransactionRequest)).not.to.be.reverted;

        allowance = await web3Toolkit.getAllowance(user.address, tokenAmount.token, spender);
        expect(allowance).to.eq(tokenAmount.amountWei);
      });
    });
  });

  context('Test getAllowances()', function () {
    const testCases = [
      {
        tokenAmounts: new TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '2'], [mainnetTokens.USDT, '3']),
      },
    ];

    testCases.forEach((testCase, i) => {
      it(`case ${i + 1}`, async function () {
        const tokens = testCase.tokenAmounts.tokens;
        let allowances = await web3Toolkit.getAllowances(user.address, tokens, spender);
        for (const allowance of allowances) {
          expect(allowance).to.eq(0);
        }

        const tokenAmounts = testCase.tokenAmounts.toArray();
        for (const tokenAmount of tokenAmounts) {
          const approveTransactionRequest = newErc20ApproveTransactionRequest(
            tokenAmount.token,
            spender,
            tokenAmount.amountWei
          );
          await expect(user.sendTransaction(approveTransactionRequest)).not.to.be.reverted;
        }

        allowances = await web3Toolkit.getAllowances(user.address, tokens, spender);
        allowances.forEach((allowance, i) => {
          expect(allowance).to.eq(tokenAmounts[i].amountWei);
        });
      });
    });
  });
});
