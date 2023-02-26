import { BigNumberish, constants, providers } from 'ethers';
import { ERC20__factory } from './contracts';
import { SetRequired } from 'type-fest';
import { Token } from './tokens';

export type TransactionRequest = SetRequired<
  Pick<providers.TransactionRequest, 'to' | 'data' | 'value' | 'gasLimit'>,
  'to' | 'data'
>;

export function newErc20ApproveTransactionRequest(
  token: Token,
  spender: string,
  amountWei?: BigNumberish
): TransactionRequest {
  const iface = ERC20__factory.createInterface();
  const data = iface.encodeFunctionData('approve', [
    spender,
    amountWei !== undefined ? amountWei : constants.MaxUint256,
  ]);

  return { to: token.address, data };
}
