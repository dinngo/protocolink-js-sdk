import {
  WrappedNativeTokenParams,
  getWrappedNativeTokenQuotation,
  getWrappedNativeTokenTokenList,
} from './wrapped-native-token';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';

describe('Utility WrappedNativeTokenLogic', function () {
  context('Test getTokenList', async function () {
    logics.utility.WrappedNativeTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const tokenList = await getWrappedNativeTokenTokenList(chainId);
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getQuotation', async function () {
    const chainId = common.ChainId.mainnet;

    const testCases: WrappedNativeTokenParams[] = [
      {
        input: { token: common.mainnetTokens.ETH, amount: '1' },
        tokenOut: common.mainnetTokens.WETH,
      },
      {
        input: { token: common.mainnetTokens.WETH, amount: '1' },
        tokenOut: common.mainnetTokens.ETH,
      },
    ];

    testCases.forEach((params, i) => {
      it(`case ${i + 1}`, async function () {
        const quotation = await getWrappedNativeTokenQuotation(chainId, params);
        expect(quotation).to.include.all.keys('input', 'output');
      });
    });
  });
});
