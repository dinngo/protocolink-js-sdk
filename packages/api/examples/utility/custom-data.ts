import * as api from '@protocolink/api';
import axios from 'axios';
import * as common from '@protocolink/common';

// interface CustomDataFields {
//   inputs?: {
//     token: {
//       chainId: number;
//       address: string;
//       decimals: number;
//       symbol: string;
//       name: string;
//     };
//     amount: string;
//   }[];
//   outputs?: {
//     token: {
//       chainId: number;
//       address: string;
//       decimals: number;
//       symbol: string;
//       name: string;
//     };
//     amount: string;
//   }[];
//   to: string;
//   data: string;
// }

// interface CustomDataLogic {
//   rid: string;
//   fields: CustomDataFields;
// }

(async () => {
  const chainId = 1;
  const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

  // 1. get quotation from 1inch api
  const fromToken = {
    chainId: 1,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  };
  const toToken = {
    chainId: 1,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  };
  const input = new common.TokenAmount(fromToken, '100');

  const { data } = await axios.get(`https://api.1inch.io/v5.0/${chainId}/swap`, {
    params: {
      fromTokenAddress: fromToken.address,
      toTokenAddress: toToken.address,
      amount: input.amountWei.toString(),
      fromAddress: account,
      slippage: 1,
      disableEstimate: true,
    },
  });
  console.log('data :>> ', JSON.stringify(data));
  const output = new common.TokenAmount(toToken).setWei(data.toTokenAmount);

  const customDataLogic = await api.protocols.utility.newCustomDataLogic({
    inputs: [input],
    outputs: [output],
    to: data.tx.to,
    data: data.tx.data,
  });
  console.log('customDataLogic :>> ', JSON.stringify(customDataLogic, null, 2));
})();
