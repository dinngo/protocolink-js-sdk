import * as common from '@protocolink/common';

/**
 * Scales the repayment amount based on a specified scale factor.
 * @param token The token involved in the scaling.
 * @param amount The initial amount to be scaled.
 * @param scale The scaling factor in basis points (bps).
 * @returns The scaled repayment amount.
 */
export function scaleRepayAmount(token: common.Token, amount: string, scale: number) {
  return common.toBigUnit(common.calcSlippage(common.toSmallUnit(amount, token.decimals), -scale), token.decimals);
}
