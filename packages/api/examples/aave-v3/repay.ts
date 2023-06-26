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
//   interestRateMode: logics.aavev3.InterestRateMode;
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
//   interestRateMode: logics.aavev3.InterestRateMode;
// }

// interface RepayLogic {
//   rid: string;
//   fields: RepayFields;
// }

(async () => {
  const chainId = 1;
  const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

  const tokenList = await api.protocols.aavev3.getRepayTokenList(chainId);
  const underlyingToken = tokenList[0];
  console.log('underlyingToken :>> ', JSON.stringify(underlyingToken, null, 2));

  const repayQuotation = await api.protocols.aavev3.getRepayQuotation(chainId, {
    borrower: account,
    tokenIn: underlyingToken,
    interestRateMode: logics.aavev3.InterestRateMode.variable,
  });
  console.log('repayQuotation :>> ', JSON.stringify(repayQuotation, null, 2));

  const repayLogic = await api.protocols.aavev3.newRepayLogic(repayQuotation);
  console.log('repayLogic :>> ', JSON.stringify(repayLogic, null, 2));
})();
