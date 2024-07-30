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
//   path: string[];
//   slippage?: number;
// }

// interface SwapTokenLogic {
//   rid: string;
//   fields: SwapTokenFields;
// }

(async () => {
  const chainId = 8822;

  const tokenList = await api.protocols.magicsea.getSwapTokenTokenList(chainId);
  const tokenIn = tokenList[0];
  const tokenOut = tokenList[2];
  console.log('tokenIn :>> ', JSON.stringify(tokenIn, null, 2));
  console.log('tokenOut :>> ', JSON.stringify(tokenOut, null, 2));

  const swapTokenQuotation = await api.protocols.magicsea.getSwapTokenQuotation(chainId, {
    input: {
      token: tokenIn,
      amount: '10',
    },
    tokenOut,
    slippage: 100,
  });
  console.log('swapTokenQuotation :>> ', JSON.stringify(swapTokenQuotation, null, 2));

  const swapTokenLogic = await api.protocols.magicsea.newSwapTokenLogic(swapTokenQuotation);
  console.log('swapTokenLogic :>> ', JSON.stringify(swapTokenLogic, null, 2));
})();
