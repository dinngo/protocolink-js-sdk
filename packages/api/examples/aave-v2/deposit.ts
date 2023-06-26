import * as api from '@protocolink/api';

// interface DepositParams {
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

// interface DepositFields {
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

// interface DepositLogic {
//   rid: string;
//   fields: DepositFields;
// }

(async () => {
  const chainId = 1;

  const tokenList = await api.protocols.aavev2.getDepositTokenList(chainId);
  const underlyingToken = tokenList[0][0];
  const aToken = tokenList[0][1];
  console.log('underlyingToken :>> ', JSON.stringify(underlyingToken, null, 2));
  console.log('aToken :>> ', JSON.stringify(aToken, null, 2));

  const depositQuotation = await api.protocols.aavev2.getDepositQuotation(chainId, {
    input: {
      token: underlyingToken,
      amount: '10',
    },
    tokenOut: aToken,
  });
  console.log('depositQuotation :>> ', JSON.stringify(depositQuotation, null, 2));

  const depositLogic = await api.protocols.aavev2.newDepositLogic(depositQuotation);
  console.log('depositLogic :>> ', JSON.stringify(depositLogic, null, 2));
})();
