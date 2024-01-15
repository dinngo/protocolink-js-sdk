import * as api from '@protocolink/api';

// interface SupplyFields {
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

// interface SupplyLogic {
//   rid: string;
//   fields: SupplyFields;
// }

(async () => {
  const chainId = 1;
  const marketId = '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc';

  const tokenList = await api.protocols.morphoblue.getSupplyTokenList(chainId);
  const asset = tokenList[marketId][0];
  console.log('asset :>> ', JSON.stringify(asset, null, 2));

  const supplyLogic = await api.protocols.morphoblue.newSupplyLogic({
    marketId,
    input: {
      token: asset,
      amount: '10',
    },
  });
  console.log('supplyLogic :>> ', JSON.stringify(supplyLogic, null, 2));
})();
