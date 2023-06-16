import { BigNumberish, constants } from 'ethers';
import { IParam } from './contracts/Router';
import { WrapMode } from './logic-types';
import * as common from '@furucombo/composable-router-common';
import invariant from 'tiny-invariant';

export interface NewLogicInputOptions {
  input: common.TokenAmount;
  balanceBps?: BigNumberish;
  amountOffset?: BigNumberish;
}

export function newLogicInput(options: NewLogicInputOptions): IParam.InputStruct {
  const { input } = options;

  let balanceBps: BigNumberish;
  let amountOrOffset: BigNumberish;
  if (options.balanceBps && options.amountOffset !== undefined) {
    invariant(common.validateBps(options.balanceBps), 'balanceBps is invalid');
    balanceBps = options.balanceBps;
    amountOrOffset = options.amountOffset;
  } else {
    balanceBps = 0;
    amountOrOffset = input.amountWei;
  }

  return { token: input.token.elasticAddress, balanceBps, amountOrOffset };
}

export interface NewLogicOptions {
  to: string;
  data: string;
  inputs?: IParam.InputStruct[];
  wrapMode?: number;
  approveTo?: string;
  callback?: string;
}

export function newLogic(options: NewLogicOptions) {
  const {
    to,
    data,
    inputs = [],
    wrapMode = WrapMode.none,
    approveTo = constants.AddressZero,
    callback = constants.AddressZero,
  } = options;
  return { to, data, inputs, wrapMode, approveTo, callback };
}
