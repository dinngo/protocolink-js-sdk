import * as api from '@protocolink/api';

// type SwapTokenParams =
//   | {
//       input: {
//         token: {
//           chainId: number;
//           address: string;
//           decimals: number;
//           symbol: string;
//           name: string;
//         };
//         amount: string;
//       };
//       tokenOut: {
//         chainId: number;
//         address: string;
//         decimals: number;
//         symbol: string;
//         name: string;
//       };
//       slippage?: number;
//     }
//   | {
//       tokenIn: {
//         chainId: number;
//         address: string;
//         decimals: number;
//         symbol: string;
//         name: string;
//       };
//       output: {
//         token: {
//           chainId: number;
//           address: string;
//           decimals: number;
//           symbol: string;
//           name: string;
//         };
//         amount: string;
//       };
//       slippage?: number;
//     };

// import * as core from '@protocolink/core';

// interface SwapTokenFields {
//   tradeType: core.TradeType;
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
//   fee?: number;
//   path?: string;
//   slippage?: number;
// }

// interface SwapTokenLogic {
//   rid: string;
//   fields: SwapTokenFields;
// }

(async () => {
  const chainId = 8822;

  const tokenList = await api.protocols.wagmi.getSwapTokenTokenList(chainId);
  const tokenIn = tokenList[0];
  const tokenOut = tokenList[2];
  console.log('tokenIn :>> ', JSON.stringify(tokenIn, null, 2));
  console.log('tokenOut :>> ', JSON.stringify(tokenOut, null, 2));

  const swapTokenQuotation = await api.protocols.wagmi.getSwapTokenQuotation(chainId, {
    input: {
      token: tokenIn,
      amount: '10',
    },
    tokenOut,
    slippage: 100,
  });
  console.log('swapTokenQuotation :>> ', JSON.stringify(swapTokenQuotation, null, 2));

  const swapTokenLogic = await api.protocols.wagmi.newSwapTokenLogic(swapTokenQuotation);
  console.log('swapTokenLogic :>> ', JSON.stringify(swapTokenLogic, null, 2));
})();
