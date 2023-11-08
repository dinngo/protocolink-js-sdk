import { Adapter } from 'src/adapter';
import { LendingFlashLoaner } from 'src/protocols/aave-v3/lending-flashloaner';
import { LendingProtocol } from 'src/protocols/aave-v3/lending-protocol';
import { LendingSwaper } from 'src/protocols/paraswap-v5/lending-swaper';

export async function setup() {
  Adapter.registerProtocol(LendingProtocol);
  Adapter.registerFlashLoaner(LendingFlashLoaner);
  Adapter.registerSwaper(LendingSwaper);
}
