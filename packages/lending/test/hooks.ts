import { LendingProtocol as AaveV2Lending } from 'src/protocols/aave-v2/lending-protocol';
import { LendingProtocol as AaveV3Lending } from 'src/protocols/aave-v3/lending-protocol';
import { Adapter } from 'src/adapter';
import { LendingProtocol as CompoundV3Lending } from 'src/protocols/compound-v3/lending-protocol';
import { LendingSwaper } from 'src/protocols/paraswap-v5/lending-swaper';
import { LendingProtocol as RadiantV2Lending } from 'src/protocols/radiant-v2/lending-protocol';

export async function setup() {
  Adapter.registerProtocol(AaveV2Lending);
  Adapter.registerProtocol(AaveV3Lending);
  Adapter.registerProtocol(CompoundV3Lending);
  Adapter.registerProtocol(RadiantV2Lending);
  Adapter.registerSwaper(LendingSwaper);
}
