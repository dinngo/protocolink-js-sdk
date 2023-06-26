import * as api from '@protocolink/api';
import * as logics from '@protocolink/logics';

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
  const marketId = logics.compoundv3.MarketId.USDC;

  const tokenList = await api.protocols.compoundv3.getSupplyCollateralTokenList(chainId);
  const asset = tokenList[marketId][0];
  console.log('asset :>> ', JSON.stringify(asset, null, 2));

  const supplyCollateralLogic = await api.protocols.compoundv3.newSupplyCollateralLogic({
    marketId,
    input: {
      token: asset,
      amount: '10',
    },
  });
  console.log('supplyCollateralLogic :>> ', JSON.stringify(supplyCollateralLogic, null, 2));
})();
