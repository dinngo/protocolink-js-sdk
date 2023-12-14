import { Comet__factory } from './contracts';
import * as common from '@protocolink/common';
import { configs } from './configs';
import { expect } from 'chai';

describe('check configs', function () {
  for (const { chainId, markets } of configs) {
    for (const market of markets) {
      it(`${common.toNetworkId(chainId)}: ${market.baseToken.symbol}`, async () => {
        const iface = Comet__factory.createInterface();
        const web3Toolkit = new common.Web3Toolkit(chainId);

        const calls: common.Multicall3.CallStruct[] = [
          {
            target: market.cometAddress,
            callData: iface.encodeFunctionData('baseToken'),
          },
          {
            target: market.cometAddress,
            callData: iface.encodeFunctionData('baseTokenPriceFeed'),
          },
        ];

        const { returnData } = await web3Toolkit.multicall3.callStatic.aggregate(calls);

        const [baseTokenAddress] = iface.decodeFunctionResult('baseToken', returnData[0]);
        expect(baseTokenAddress).to.eq(market.baseToken.address);

        const [baseTokenPriceFeedAddress] = iface.decodeFunctionResult('baseTokenPriceFeed', returnData[1]);
        expect(baseTokenPriceFeedAddress).to.eq(market.baseTokenPriceFeedAddress);
      });
    }
  }
});
