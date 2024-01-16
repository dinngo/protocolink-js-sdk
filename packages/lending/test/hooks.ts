import { Adapter } from 'src/adapter';
import { aavev2, aavev3, compoundv3, morphoblue, radiantv2 } from 'src/protocols';
import { paraswapv5 } from 'src/swappers';

export async function setup() {
  Adapter.registerProtocol(aavev2.LendingProtocol);
  Adapter.registerProtocol(aavev3.LendingProtocol);
  Adapter.registerProtocol(compoundv3.LendingProtocol);
  Adapter.registerProtocol(radiantv2.LendingProtocol);
  Adapter.registerProtocol(morphoblue.LendingProtocol);
  Adapter.registerSwapper(paraswapv5.LendingSwapper);
}
