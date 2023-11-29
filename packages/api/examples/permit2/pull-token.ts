import * as api from '@protocolink/api';

// interface PullTokenFields {
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

// interface PullTokenLogic {
//   rid: string;
//   fields: PullTokenFields;
// }

(async () => {
  const chainId = 1;

  const tokenList = await api.protocols.permit2.getPullTokenTokenList(chainId);
  const tokenIn = tokenList[0];
  console.log('tokenIn :>> ', JSON.stringify(tokenIn, null, 2));

  const pullTokenLogic = await api.protocols.permit2.newPullTokenLogic({
    input: {
      token: tokenIn,
      amount: '10',
    },
  });

  console.log('pullTokenLogic :>> ', JSON.stringify(pullTokenLogic, null, 2));
})();
