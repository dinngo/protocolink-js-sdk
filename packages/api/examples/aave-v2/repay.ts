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
//   interestRateMode: logics.aavev2.InterestRateMode;
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
//   interestRateMode: logics.aavev2.InterestRateMode;
// }

// interface RepayLogic {
//   rid: string;
//   fields: RepayFields;
// }

(async () => {
  const chainId = 1;
  const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

  const tokenList = await api.protocols.aavev2.getRepayTokenList(chainId);
  const underlyingToken = tokenList[0];
  console.log('underlyingToken :>> ', JSON.stringify(underlyingToken, null, 2));

  const repayQuotation = await api.protocols.aavev2.getRepayQuotation(chainId, {
    borrower: account,
    tokenIn: underlyingToken,
    interestRateMode: logics.aavev2.InterestRateMode.variable,
  });
  console.log('repayQuotation :>> ', JSON.stringify(repayQuotation, null, 2));

  const repayLogic = await api.protocols.aavev2.newRepayLogic(repayQuotation);
  console.log('repayLogic :>> ', JSON.stringify(repayLogic, null, 2));
})();
