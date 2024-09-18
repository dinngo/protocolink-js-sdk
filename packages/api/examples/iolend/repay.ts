import * as api from '@protocolink/api';
import * as logics from '@protocolink/logics';

// interface RepayParams {
//   tokenIn: {
//     chainId: number;
//     address: string;
//     decimals: number;
//     symbol: string;
//     name: string;
//   };
//   borrower: string;
//   interestRateMode: logics.iolend.InterestRateMode;
// }

// interface RepayFields {
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
//   interestRateMode: logics.iolend.InterestRateMode;
// }

// interface RepayLogic {
//   rid: string;
//   fields: RepayFields;
// }

(async () => {
  const chainId = 8822;
  const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

  const tokenList = await api.protocols.iolend.getRepayTokenList(chainId);
  const underlyingToken = tokenList[0];
  console.log('underlyingToken :>> ', JSON.stringify(underlyingToken, null, 2));

  const repayQuotation = await api.protocols.iolend.getRepayQuotation(chainId, {
    borrower: account,
    tokenIn: underlyingToken,
    interestRateMode: logics.iolend.InterestRateMode.variable,
  });
  console.log('repayQuotation :>> ', JSON.stringify(repayQuotation, null, 2));

  const repayLogic = await api.protocols.iolend.newRepayLogic(repayQuotation);
  console.log('repayLogic :>> ', JSON.stringify(repayLogic, null, 2));
})();
