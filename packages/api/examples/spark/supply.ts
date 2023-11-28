import * as api from '@protocolink/api';

// interface SupplyParams {
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

// interface SupplyFields {
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

// interface SupplyLogic {
//   rid: string;
//   fields: SupplyFields;
// }

(async () => {
  const chainId = 1;

  const tokenList = await api.protocols.spark.getSupplyTokenList(chainId);
  const underlyingToken = tokenList[0][0];
  const aToken = tokenList[0][1];
  console.log('underlyingToken :>> ', JSON.stringify(underlyingToken, null, 2));
  console.log('aToken :>> ', JSON.stringify(aToken, null, 2));

  const supplyQuotation = await api.protocols.spark.getSupplyQuotation(chainId, {
    input: {
      token: underlyingToken,
      amount: '10',
    },
    tokenOut: aToken,
  });
  console.log('supplyQuotation :>> ', JSON.stringify(supplyQuotation, null, 2));

  const supplyLogic = await api.protocols.spark.newSupplyLogic(supplyQuotation);
  console.log('supplyLogic :>> ', JSON.stringify(supplyLogic, null, 2));
})();
