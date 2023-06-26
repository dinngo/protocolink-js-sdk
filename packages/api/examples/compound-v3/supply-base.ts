import * as api from '@protocolink/api';
import * as logics from '@protocolink/logics';

// interface SupplyBaseParams {
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

// interface SupplyBaseFields {
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

// interface SupplyBaseLogic {
//   rid: string;
//   fields: SupplyBaseFields;
// }

(async () => {
  const chainId = 1;
  const marketId = logics.compoundv3.MarketId.USDC;

  const tokenList = await api.protocols.compoundv3.getSupplyBaseTokenList(chainId);
  const baseToken = tokenList[marketId][0][0];
  const cToken = tokenList[marketId][0][1];
  console.log('baseToken :>> ', JSON.stringify(baseToken, null, 2));
  console.log('cToken :>> ', JSON.stringify(cToken, null, 2));

  const supplyBaseQuotation = await api.protocols.compoundv3.getSupplyBaseQuotation(chainId, {
    marketId,
    input: {
      token: baseToken,
      amount: '10',
    },
    tokenOut: cToken,
  });
  console.log('supplyBaseQuotation :>> ', JSON.stringify(supplyBaseQuotation, null, 2));

  const supplyBaseLogic = await api.protocols.compoundv3.newSupplyBaseLogic(supplyBaseQuotation);
  console.log('supplyBaseLogic :>> ', JSON.stringify(supplyBaseLogic, null, 2));
})();
