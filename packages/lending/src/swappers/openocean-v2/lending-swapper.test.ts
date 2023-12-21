import { LendingSwapper } from './lending-swapper';
import { SwapperQuoteParams } from 'src/swapper.type';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { metisTokens } from 'src/tokens';

describe('Test Radiant V2 LendingProtocol', function () {
  context('Test getPortfolio', function () {
    const testCases: { chainId: common.ChainId; params: SwapperQuoteParams }[] = [
      {
        chainId: common.ChainId.metis,
        params: {
          input: new common.TokenAmount(metisTokens['m.DAI'], '1'),
          tokenOut: metisTokens['m.USDC'],
          slippage: 100,
        },
      },
      {
        chainId: common.ChainId.metis,
        params: {
          tokenIn: metisTokens['m.DAI'],
          output: new common.TokenAmount(metisTokens['m.USDC'], '1'),
          slippage: 100,
        },
      },
    ];

    testCases.forEach(({ chainId, params }) => {
      it(`${common.toNetworkId(chainId)} market`, async function () {
        const swapper = new LendingSwapper(chainId);
        const fields = await swapper.quote(params);
        expect(fields.output.gt('0')).to.be.true;
      });
    });
  });
});
