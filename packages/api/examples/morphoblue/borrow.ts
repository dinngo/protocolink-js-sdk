import * as api from '@protocolink/api';

// interface BorrowFields {
//   marketId: string;
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

// interface BorrowLogic {
//   rid: string;
//   fields: BorrowFields;
// }

(async () => {
  const chainId = 1;
  const marketId = '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc';

  const tokenList = await api.protocols.morphoblue.getBorrowTokenList(chainId);
  const loanToken = tokenList[marketId][0];
  console.log('loanToken :>> ', JSON.stringify(loanToken, null, 2));

  const borrowLogic = await api.protocols.morphoblue.newBorrowLogic({
    marketId,
    output: {
      token: loanToken,
      amount: '10',
    },
  });
  console.log('borrowLogic :>> ', JSON.stringify(borrowLogic, null, 2));
})();
