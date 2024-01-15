import * as api from '@protocolink/api';

// interface WithdrawFields {
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
// }

// interface WithdrawLogic {
//   rid: string;
//   fields: WithdrawFields;
// }

(async () => {
  const chainId = 1;
  const marketId = '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc';

  const tokenList = await api.protocols.morphoblue.getWithdrawTokenList(chainId);
  const asset = tokenList[marketId][0];
  console.log('asset :>> ', JSON.stringify(asset, null, 2));

  const withdrawLogic = await api.protocols.morphoblue.newWithdrawLogic({
    marketId,
    output: {
      token: asset,
      amount: '10',
    },
  });
  console.log('withdrawLogic :>> ', JSON.stringify(withdrawLogic, null, 2));
})();
