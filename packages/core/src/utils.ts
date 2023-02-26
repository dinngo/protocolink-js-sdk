import { BigNumberish, constants } from 'ethers';
import { IRouter } from './contracts/Router';
import * as common from '@composable-router/common';
import invariant from 'tiny-invariant';

export interface NewLogicInputOptions {
  input: common.TokenAmount;
  amountBps?: BigNumberish;
  amountOffset?: BigNumberish;
}

export function newLogicInput(options: NewLogicInputOptions): IRouter.InputStruct {
  const { input } = options;

  let amountBps: BigNumberish;
  let amountOrOffset: BigNumberish;
  if (options.amountBps && options.amountOffset !== undefined) {
    invariant(common.validateAmountBps(options.amountBps), 'amountBps is invalid');
    amountBps = options.amountBps;
    amountOrOffset = options.amountOffset;
  } else {
    amountBps = constants.MaxUint256;
    amountOrOffset = input.amountWei;
  }

  return { token: input.token.elasticAddress, amountBps, amountOrOffset };
}

export interface NewLogicOutputOptions {
  output: common.TokenAmount;
  slippage?: number;
}

export function newLogicOutput(options: NewLogicOutputOptions): IRouter.OutputStruct {
  const { output, slippage = 0 } = options;

  return {
    token: output.token.elasticAddress,
    amountMin: slippage ? common.calcSlippage(output.amountWei, slippage) : output.amountWei,
  };
}

export interface NewLogicOptions {
  to: string;
  data: string;
  inputs?: IRouter.InputStruct[];
  outputs?: IRouter.OutputStruct[];
  approveTo?: string;
  callback?: string;
}

export function newLogic(options: NewLogicOptions) {
  const {
    to,
    data,
    inputs = [],
    outputs = [],
    approveTo = constants.AddressZero,
    callback = constants.AddressZero,
  } = options;
  return { to, data, inputs, outputs, approveTo, callback };
}
