import BigNumberJS from 'bignumber.js';

export function bpsBound(amount: string, bps = 100, bpsBase = 10000): [string, string] {
  const amountBigNum = BigNumberJS(amount);
  const offset = amountBigNum.times(bps).div(bpsBase);
  const max = amountBigNum.plus(offset);
  const min = amountBigNum.minus(offset);
  return [min.toString(), max.toString()];
}
