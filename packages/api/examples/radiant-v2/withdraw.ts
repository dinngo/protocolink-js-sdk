import * as api from '@protocolink/api';

// interface WithdrawParams {
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

// interface WithdrawFields {
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

// interface WithdrawLogic {
//   rid: string;
//   fields: WithdrawFields;
// }

(async () => {
  const chainId = 42161;

  const tokenList = await api.protocols.radiantv2.getWithdrawTokenList(chainId);
  const rToken = tokenList[0][0];
  const underlyingToken = tokenList[0][1];
  console.log('rToken :>> ', JSON.stringify(rToken, null, 2));
  console.log('underlyingToken :>> ', JSON.stringify(underlyingToken, null, 2));

  const withdrawQuotation = await api.protocols.radiantv2.getWithdrawQuotation(chainId, {
    input: {
      token: rToken,
      amount: '10',
    },
    tokenOut: underlyingToken,
  });
  console.log('withdrawQuotation :>> ', JSON.stringify(withdrawQuotation, null, 2));

  const withdrawLogic = await api.protocols.radiantv2.newWithdrawLogic(withdrawQuotation);
  console.log('withdrawLogic :>> ', JSON.stringify(withdrawLogic, null, 2));
})();
