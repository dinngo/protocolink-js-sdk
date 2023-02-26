import { IRouter } from './contracts/Router';
import * as common from '@composable-router/common';
import path from 'path';

export interface LogicInstanceInterface {
  getLogic(fields: object, options?: object): Promise<IRouter.LogicStruct>;
}

export abstract class Logic extends common.Web3Toolkit {
  static id: string;
  static protocol: string;

  static get rid() {
    return `${this.protocol}:${this.id}`;
  }

  abstract getLogic(fields: object, options?: object): Promise<IRouter.LogicStruct>;
}

export abstract class ExchangeLogic extends Logic {
  abstract getPrice(params: object): unknown;
}

export interface LogicInterface {
  new (...args: any[]): Logic;
  id: string;
  protocol: string;
  rid: string;
  supportedChainIds: number[];
}

export function LogicDefinitionDecorator() {
  return (logic: LogicInterface) => {
    const [, , , logicFilePath] = common.getErrorStackCallerPaths();
    logic.id = path.basename(logicFilePath).split('.')[1];
    logic.protocol = path.basename(path.dirname(logicFilePath));
  };
}
