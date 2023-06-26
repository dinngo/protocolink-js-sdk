import { RouterData } from './types';
import { buildRouterTransactionRequest, estimateRouterData, getProtocolTokenList, quote } from './api';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import * as logics from '@protocolink/logics';
import { mainnetTokens } from '@protocolink/test-helpers';
import * as utility from 'src/protocols/utility';

describe('API client', function () {
  it('Test getProtocolTokenList', async function () {
    const tokenList = await getProtocolTokenList(common.ChainId.mainnet, logics.uniswapv3.SwapTokenLogic.rid);
    expect(tokenList).to.have.lengthOf.above(0);
  });

  it('Test quote', async function () {
    const params = { input: new common.TokenAmount(mainnetTokens.ETH, '1'), tokenOut: mainnetTokens.USDC };
    const quotation = await quote(common.ChainId.mainnet, logics.uniswapv3.SwapTokenLogic.rid, params);
    expect(quotation).to.include.all.keys('tradeType', 'input', 'output');
    expect(quotation).to.have.any.keys('path', 'fee');
  });

  const routerData: RouterData = {
    chainId: common.ChainId.mainnet,
    account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
    logics: [
      utility.newSendTokenLogic({
        input: { token: mainnetTokens.ETH, amount: '1' },
        recipient: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      }),
      utility.newSendTokenLogic({
        input: { token: mainnetTokens.USDC, amount: '1' },
        recipient: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      }),
    ],
  };

  it('Test estimateRouterData', async function () {
    const estimateResult = await estimateRouterData(routerData);
    expect(estimateResult).to.include.all.keys('funds', 'balances', 'approvals', 'permitData');
  });

  it('Test buildRouterTransactionRequest', async function () {
    const transactionRequest = await buildRouterTransactionRequest(routerData);
    expect(transactionRequest).to.include.all.keys('to', 'data', 'value');
  });
});
