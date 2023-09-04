import { IParam } from './contracts/Router';
import { RouterToolkit } from './router-toolkit';
import * as common from '@protocolink/common';
import path from 'path';

export abstract class Logic extends RouterToolkit {
  static id: string;
  static protocolId: string;
  static get rid() {
    return `${this.protocolId}:${this.id}`;
  }
  static supportedChainIds: number[] = [];
}

export interface LogicTokenListInterface {
  getTokenList(): any;
}

export interface LogicOracleInterface {
  quote(params: any): any;
}

export interface LogicBuilderInterface {
  build(fields: any, options?: any): Promise<IParam.LogicStruct>;
}

export interface LogicMultiBuilderInterface {
  build(fields: any, options?: any): Promise<IParam.LogicStruct[]>;
}

export interface LogicClassInterface {
  new (...args: any[]): Logic;
  id: string;
  protocolId: string;
  rid: string;
  supportedChainIds: number[];
}

export function LogicDefinitionDecorator() {
  return (logic: LogicClassInterface) => {
    const [, , , logicFilePath] = common.getErrorStackCallerPaths();
    logic.id = path.basename(logicFilePath).split('.')[1];
    logic.protocolId = path.basename(path.dirname(logicFilePath));
  };
}
