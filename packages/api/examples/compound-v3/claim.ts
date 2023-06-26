import * as api from '@protocolink/api';
import * as logics from '@protocolink/logics';

// interface ClaimParams {
//   marketId: string;
//   owner: string;
// }

// interface ClaimFields {
//   marketId: string;
//   owner: string;
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

// interface ClaimLogic {
//   rid: string;
//   fields: ClaimFields;
// }

(async () => {
  const chainId = 1;
  const marketId = logics.compoundv3.MarketId.USDC;
  const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

  const tokenList = await api.protocols.compoundv3.getClaimTokenList(chainId);
  const COMP = tokenList[0];
  console.log('COMP :>> ', JSON.stringify(COMP, null, 2));

  const claimQuotation = await api.protocols.compoundv3.getClaimQuotation(chainId, {
    marketId,
    owner: account,
  });
  console.log('claimQuotation :>> ', JSON.stringify(claimQuotation, null, 2));

  const claimLogic = await api.protocols.compoundv3.newClaimLogic(claimQuotation);
  console.log('claimLogic :>> ', JSON.stringify(claimLogic, null, 2));
})();
