import * as api from '@protocolink/api';

// interface WrappedNativeTokenParams {
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
// }

// interface WrappedNativeTokenFields {
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
// }

// interface WrappedNativeTokenLogic {
//   rid: string;
//   fields: WrappedNativeTokenFields;
// }

(async () => {
  const chainId = 1;

  const tokenList = await api.protocols.utility.getWrappedNativeTokenTokenList(chainId);
  const wrapTokenIn = tokenList[0][0]; // native token
  const wrapTokenOut = tokenList[0][1]; // wrapped native token
  console.log('wrapTokenIn :>> ', JSON.stringify(wrapTokenIn, null, 2));
  console.log('wrapTokenOut :>> ', JSON.stringify(wrapTokenOut, null, 2));

  const wrapQuotation = await api.protocols.utility.getWrappedNativeTokenQuotation(chainId, {
    input: {
      token: wrapTokenIn,
      amount: '10',
    },
    tokenOut: wrapTokenOut,
  });
  console.log('wrapQuotation :>> ', JSON.stringify(wrapQuotation, null, 2));

  const wrapLogic = await api.protocols.utility.newWrappedNativeTokenLogic(wrapQuotation);
  console.log('wrapLogic :>> ', JSON.stringify(wrapLogic, null, 2));

  const unwrapTokenIn = tokenList[1][0]; // wrapped native token
  const unwrapTokenOut = tokenList[1][1]; // native token
  console.log('unwrapTokenIn :>> ', JSON.stringify(unwrapTokenIn, null, 2));
  console.log('unwrapTokenOut :>> ', JSON.stringify(unwrapTokenOut, null, 2));

  const unwrapQuotation = await api.protocols.utility.getWrappedNativeTokenQuotation(chainId, {
    input: {
      token: unwrapTokenIn,
      amount: '10',
    },
    tokenOut: unwrapTokenOut,
  });
  console.log('unwrapQuotation :>> ', JSON.stringify(unwrapQuotation, null, 2));

  const unwrapLogic = await api.protocols.utility.newWrappedNativeTokenLogic(unwrapQuotation);
  console.log('unwrapLogic :>> ', JSON.stringify(unwrapLogic, null, 2));
})();
