import { Adapter } from 'src/adapter';
import { aavev2, aavev3, compoundv3, morphoblue, radiantv2, spark } from 'src/protocols';
import * as common from '@protocolink/common';
import { paraswapv5 } from 'src/swappers';

if (process.env.MAINNET_RPC_URL) common.setNetwork(common.ChainId.mainnet, { rpcUrl: process.env.MAINNET_RPC_URL });
if (process.env.OPTIMISM_RPC_URL) common.setNetwork(common.ChainId.optimism, { rpcUrl: process.env.OPTIMISM_RPC_URL });
if (process.env.BNB_RPC_URL) common.setNetwork(common.ChainId.bnb, { rpcUrl: process.env.BNB_RPC_URL });
if (process.env.GNOSIS_RPC_URL) common.setNetwork(common.ChainId.gnosis, { rpcUrl: process.env.GNOSIS_RPC_URL });
if (process.env.POLYGON_RPC_URL) common.setNetwork(common.ChainId.polygon, { rpcUrl: process.env.POLYGON_RPC_URL });
if (process.env.ZKSYNC_RPC_URL) common.setNetwork(common.ChainId.zksync, { rpcUrl: process.env.ZKSYNC_RPC_URL });
if (process.env.METIS_RPC_URL) common.setNetwork(common.ChainId.metis, { rpcUrl: process.env.METIS_RPC_URL });
if (process.env.BASE_RPC_URL) common.setNetwork(common.ChainId.base, { rpcUrl: process.env.BASE_RPC_URL });
if (process.env.ARBITRUM_RPC_URL) common.setNetwork(common.ChainId.arbitrum, { rpcUrl: process.env.ARBITRUM_RPC_URL });
if (process.env.AVALANCHE_RPC_URL)
  common.setNetwork(common.ChainId.avalanche, { rpcUrl: process.env.AVALANCHE_RPC_URL });

Adapter.registerProtocol(aavev2.LendingProtocol);
Adapter.registerProtocol(aavev3.LendingProtocol);
Adapter.registerProtocol(compoundv3.LendingProtocol);
Adapter.registerProtocol(morphoblue.LendingProtocol);
Adapter.registerProtocol(radiantv2.LendingProtocol);
Adapter.registerProtocol(spark.LendingProtocol);
Adapter.registerSwapper(paraswapv5.LendingSwapper);
