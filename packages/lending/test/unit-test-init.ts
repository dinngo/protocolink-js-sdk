import { Adapter } from 'src/adapter';
import { aavev2, aavev3, compoundv3, radiantv2 } from 'src/protocols';
import * as common from '@protocolink/common';
import { paraswapv5 } from 'src/swappers';

common.setNetwork(common.ChainId.arbitrum, { rpcUrl: 'https://arbitrum-one-rpc.allthatnode.com' });

Adapter.registerProtocol(aavev2.LendingProtocol);
Adapter.registerProtocol(aavev3.LendingProtocol);
Adapter.registerProtocol(compoundv3.LendingProtocol);
Adapter.registerProtocol(radiantv2.LendingProtocol);
Adapter.registerSwapper(paraswapv5.LendingSwapper);
