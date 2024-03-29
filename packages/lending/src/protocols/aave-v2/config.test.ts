import { ProtocolDataProvider__factory } from './contracts';
import * as common from '@protocolink/common';
import { configs } from './configs';
import { expect } from 'chai';

describe('Check Aave V2 configs', function () {
  for (const { chainId, contractMap, reserves } of configs) {
    it(`${common.toNetworkId(chainId)}`, async () => {
      const iface = ProtocolDataProvider__factory.createInterface();
      const calls: common.Multicall3.CallStruct[] = reserves.map(({ asset }) => ({
        target: contractMap.ProtocolDataProvider,
        callData: iface.encodeFunctionData('getReserveTokensAddresses', [asset.wrapped.address]),
      }));

      const web3Toolkit = new common.Web3Toolkit(chainId);
      const { returnData } = await web3Toolkit.multicall3.callStatic.aggregate(calls);
      for (let i = 0; i < reserves.length; i++) {
        const reserve = reserves[i];
        const [aTokenAddress] = iface.decodeFunctionResult('getReserveTokensAddresses', returnData[i]);
        expect(aTokenAddress).to.eq(reserve.aToken.address);
      }
    });
  }
});
