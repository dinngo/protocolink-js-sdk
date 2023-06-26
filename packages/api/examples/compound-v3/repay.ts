import * as api from '@protocolink/api';
import * as logics from '@protocolink/logics';

// interface RepayParams {
//   marketId: string;
//   tokenIn: {
//     chainId: number;
//     address: string;
//     decimals: number;
//     symbol: string;
//     name: string;
//   };
//   borrower: string;
// }

// interface RepayFields {
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
//   borrower: string;
// }

// interface RepayLogic {
//   rid: string;
//   fields: RepayFields;
// }

(async () => {
  const chainId = 1;
  const marketId = logics.compoundv3.MarketId.USDC;
  const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

  const tokenList = await api.protocols.compoundv3.getRepayTokenList(chainId);
  const baseToken = tokenList[marketId][0];
  console.log('baseToken :>> ', JSON.stringify(baseToken, null, 2));

  const repayQuotation = await api.protocols.compoundv3.getRepayQuotation(chainId, {
    marketId,
    tokenIn: baseToken,
    borrower: account,
  });
  console.log('repayQuotation :>> ', JSON.stringify(repayQuotation, null, 2));

  const repayLogic = await api.protocols.compoundv3.newRepayLogic(repayQuotation);
  console.log('repayLogic :>> ', JSON.stringify(repayLogic, null, 2));
})();
