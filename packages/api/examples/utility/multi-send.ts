import * as api from '@protocolink/api';

// type MultiSendFields = {
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
//   recipient: string;
// }[];

// interface MultiSendLogic {
//   rid: string;
//   fields: MultiSendFields;
// }

(async () => {
  const chainId = 1;

  const tokenList = await api.protocols.utility.getMultiSendTokenList(chainId);
  const tokenA = tokenList[0];
  const tokenB = tokenList[1];
  console.log('tokenA :>> ', JSON.stringify(tokenA, null, 2));
  console.log('tokenB :>> ', JSON.stringify(tokenB, null, 2));

  const multiSendLogic = await api.protocols.utility.newMultiSendLogic([
    {
      input: {
        token: tokenA,
        amount: '10',
      },
      recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
    },
    {
      input: {
        token: tokenB,
        amount: '10',
      },
      recipient: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
  ]);
  console.log('multiSendLogic :>> ', JSON.stringify(multiSendLogic, null, 2));
})();
