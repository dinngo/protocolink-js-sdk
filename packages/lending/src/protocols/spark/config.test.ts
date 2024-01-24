import { PoolDataProvider__factory } from './contracts';
import * as common from '@protocolink/common';
import { configs } from './configs';
import { expect } from 'chai';

describe('Check Spark configs', function () {
  for (const { chainId, contractMap, reserves } of configs) {
    it(`${common.toNetworkId(chainId)}`, async () => {
      const iface = PoolDataProvider__factory.createInterface();
      const calls: common.Multicall3.CallStruct[] = [];
      for (const { asset } of reserves) {
        calls.push({
          target: contractMap.PoolDataProvider,
          callData: iface.encodeFunctionData('getReserveTokensAddresses', [asset.wrapped.address]),
        });
        if (!asset.isNative) {
          calls.push({
            target: contractMap.PoolDataProvider,
            callData: iface.encodeFunctionData('getFlashLoanEnabled', [asset.address]),
          });
        }
      }

      const web3Toolkit = new common.Web3Toolkit(chainId);
      const { returnData } = await web3Toolkit.multicall3.callStatic.aggregate(calls);

      let j = 0;
      for (const reserve of reserves) {
        const [aTokenAddress] = iface.decodeFunctionResult('getReserveTokensAddresses', returnData[j]);
        expect(aTokenAddress).to.eq(reserve.aToken.address);
        j++;

        if (!reserve.asset.isNative) {
          const [flashLoanEnabled] = iface.decodeFunctionResult('getFlashLoanEnabled', returnData[j]);
          if (flashLoanEnabled) {
            expect(reserve.used.flashLoan).to.be.true;
          }
          j++;
        }
      }
    });
  }
});
