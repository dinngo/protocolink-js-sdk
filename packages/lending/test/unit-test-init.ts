import { Adapter } from 'src/adapter';
import { aavev2, aavev3, compoundv3, morphoblue, radiantv2, spark } from 'src/protocols';
import * as common from '@protocolink/common';
import { paraswapv5 } from 'src/swappers';

if (process.env.MAINNET_RPC_URL) {
  common.setNetwork(common.ChainId.mainnet, { rpcUrl: process.env.MAINNET_RPC_URL });
}

// common.setNetwork(common.ChainId.arbitrum, { rpcUrl: 'https://arbitrum-one-rpc.allthatnode.com' });

Adapter.registerProtocol(aavev2.LendingProtocol);
Adapter.registerProtocol(aavev3.LendingProtocol);
Adapter.registerProtocol(compoundv3.LendingProtocol);
Adapter.registerProtocol(morphoblue.LendingProtocol);
Adapter.registerProtocol(radiantv2.LendingProtocol);
Adapter.registerProtocol(spark.LendingProtocol);
Adapter.registerSwapper(paraswapv5.LendingSwapper);
