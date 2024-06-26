import { Comet__factory } from './contracts';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { marketMap, priceFeedMap } from './configs';

describe('Check Compound V3 configs', function () {
  for (const [_chainId, marketConfigMap] of Object.entries(marketMap)) {
    for (const [id, { comet, baseToken }] of Object.entries(marketConfigMap)) {
      const chainId = Number(_chainId);
      it(`${common.toNetworkId(Number(chainId))}: ${baseToken.symbol}`, async () => {
        const iface = Comet__factory.createInterface();
        const web3Toolkit = new common.Web3Toolkit(Number(chainId));

        const calls: common.Multicall3.CallStruct[] = [
          {
            target: comet.address,
            callData: iface.encodeFunctionData('baseToken'),
          },
          {
            target: comet.address,
            callData: iface.encodeFunctionData('baseTokenPriceFeed'),
          },
        ];

        const { returnData } = await web3Toolkit.multicall3.callStatic.aggregate(calls);

        const [baseTokenAddress] = iface.decodeFunctionResult('baseToken', returnData[0]);
        expect(baseTokenAddress).to.eq(baseToken.address);

        const [baseTokenPriceFeedAddress] = iface.decodeFunctionResult('baseTokenPriceFeed', returnData[1]);
        expect(baseTokenPriceFeedAddress).to.eq(priceFeedMap[chainId][id].baseTokenPriceFeedAddress);
      });
    }
  }
});
