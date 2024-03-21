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
//   apiKey: string;
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
//   slippage?: number;
//   apiKey: string;
// }

// interface SwapTokenLogic {
//   rid: string;
//   fields: SwapTokenFields;
// }

const apiKey = process.env.ZEROEX_API_KEY as string;

(async () => {
  const chainId = 1;

  const tokenList = await api.protocols.zeroexv4.getSwapTokenTokenList(chainId);
  const tokenIn = tokenList[0];
  const tokenOut = tokenList[2];
  console.log('tokenIn :>> ', JSON.stringify(tokenIn, null, 2));
  console.log('tokenOut :>> ', JSON.stringify(tokenOut, null, 2));

  const swapTokenQuotation = await api.protocols.zeroexv4.getSwapTokenQuotation(chainId, {
    input: {
      token: tokenIn,
      amount: '10',
    },
    tokenOut,
    slippage: 100,
    apiKey,
  });

  const swapTokenLogic = await api.protocols.zeroexv4.newSwapTokenLogic(swapTokenQuotation);

  swapTokenQuotation.apiKey = ''; // only used for hiding the key, do not use it in your project
  swapTokenLogic.fields.apiKey = ''; // only used for hiding the key, do not use it in your project
  console.log('swapTokenQuotation :>> ', JSON.stringify(swapTokenQuotation, null, 2));
  console.log('swapTokenLogic :>> ', JSON.stringify(swapTokenLogic, null, 2));
})();
