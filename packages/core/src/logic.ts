import { IRouter } from './contracts/Router';
import * as common from '@composable-router/common';
import path from 'path';

export abstract class Logic extends common.Web3Toolkit {
  static id: string;
  static protocol: string;

  static get rid() {
    return `${this.protocol}:${this.id}`;
  }

  abstract getLogic(fields: any, options?: any): Promise<IRouter.LogicStruct>;
}

export interface LogicInterfaceGetSupportedTokens {
  getSupportedTokens(): any;
}

export interface LogicInterfaceGetPrice {
  getPrice(params: any): any;
}

export interface LogicClassInterface {
  new (...args: any[]): Logic;
  id: string;
  protocol: string;
  rid: string;
  supportedChainIds: number[];
}

export function LogicDefinitionDecorator() {
  return (logic: LogicClassInterface) => {
    const [, , , logicFilePath] = common.getErrorStackCallerPaths();
    logic.id = path.basename(logicFilePath).split('.')[1];
    logic.protocol = path.basename(path.dirname(logicFilePath));
  };
}
