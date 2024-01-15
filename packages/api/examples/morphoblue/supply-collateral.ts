import * as api from '@protocolink/api';

// interface SupplyCollateralFields {
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

// interface SupplyCollateralLogic {
//   rid: string;
//   fields: SupplyCollateralFields;
// }

(async () => {
  const chainId = 1;
  const marketId = '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc';

  const tokenList = await api.protocols.morphoblue.getSupplyCollateralTokenList(chainId);
  const asset = tokenList[marketId][0];
  console.log('asset :>> ', JSON.stringify(asset, null, 2));

  const supplyCollateralLogic = await api.protocols.morphoblue.newSupplyCollateralLogic({
    marketId,
    input: {
      token: asset,
      amount: '10',
    },
  });
  console.log('supplyCollateralLogic :>> ', JSON.stringify(supplyCollateralLogic, null, 2));
})();
