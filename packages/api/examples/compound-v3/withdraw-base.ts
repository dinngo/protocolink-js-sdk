import * as api from '@protocolink/api';
import * as logics from '@protocolink/logics';

// interface WithdrawBaseParams {
//   marketId: string;
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

// interface WithdrawBaseFields {
//   marketId: string;
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

// interface WithdrawBaseLogic {
//   rid: string;
//   fields: WithdrawBaseFields;
// }

(async () => {
  const chainId = 1;
  const marketId = logics.compoundv3.MarketId.USDC;

  const tokenList = await api.protocols.compoundv3.getWithdrawBaseTokenList(chainId);
  const cToken = tokenList[marketId][0][0];
  const baseToken = tokenList[marketId][0][1];
  console.log('cToken :>> ', JSON.stringify(cToken, null, 2));
  console.log('baseToken :>> ', JSON.stringify(baseToken, null, 2));

  const withdrawBaseQuotation = await api.protocols.compoundv3.getWithdrawBaseQuotation(chainId, {
    marketId,
    input: {
      token: cToken,
      amount: '10',
    },
    tokenOut: baseToken,
  });
  console.log('withdrawBaseQuotation :>> ', JSON.stringify(withdrawBaseQuotation, null, 2));

  const withdrawBaseLogic = await api.protocols.compoundv3.newWithdrawBaseLogic(withdrawBaseQuotation);
  console.log('withdrawBaseLogic :>> ', JSON.stringify(withdrawBaseLogic, null, 2));
})();
