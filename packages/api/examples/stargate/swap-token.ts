import * as api from '@protocolink/api';

// interface SwapTokenParams {
//   input: {
//     token: {
//       chainId: number;
//       address: string;
//       decimals: number;
//       symbol: string;
//       name: string;
//     };
//     amount: string;
//   };
//   tokenOut: {
//     chainId: number;
//     address: string;
//     decimals: number;
//     symbol: string;
//     name: string;
//   };
//   receiver: string;
//   slippage?: number;
// }

// interface SwapTokenFields {
//   input: {
//     token: {
//       chainId: number;
//       address: string;
//       decimals: number;
//       symbol: string;
//       name: string;
//     };
//     amount: string;
//   };
//   output: {
//     token: {
//       chainId: number;
//       address: string;
//       decimals: number;
//       symbol: string;
//       name: string;
//     };
//     amount: string;
//   };
//   receiver: string;
//   fee: string;
//   slippage?: number;
// }

// interface SwapTokenLogic {
//   rid: string;
//   fields: SwapTokenFields;
// }

(async () => {
  const chainId = 1;
  const receiver = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

  const tokenList = await api.protocols.stargate.getSwapTokenTokenList(chainId);
  const tokenIn = tokenList[0].srcToken;
  const tokenOut = tokenList[0].destTokenLists[0].tokens[0];
  console.log('tokenIn :>> ', JSON.stringify(tokenIn, null, 2));
  console.log('tokenOut :>> ', JSON.stringify(tokenOut, null, 2));

  const swapTokenQuotation = await api.protocols.stargate.getSwapTokenQuotation(chainId, {
    input: {
      token: tokenIn,
      amount: '10',
    },
    tokenOut,
    receiver,
    slippage: 100,
  });
  console.log('swapTokenQuotation :>> ', JSON.stringify(swapTokenQuotation, null, 2));

  const swapTokenLogic = await api.protocols.stargate.newSwapTokenLogic(swapTokenQuotation);
  console.log('swapTokenLogic :>> ', JSON.stringify(swapTokenLogic, null, 2));
})();
