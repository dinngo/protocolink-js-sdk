import { DataType } from './contracts/Router';
import { RouterKit } from './router-kit';

export abstract class Logic extends RouterKit {
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
  build(fields: any, options?: any): Promise<DataType.LogicStruct>;
}

export interface LogicMultiBuilderInterface {
  build(fields: any, options?: any): Promise<DataType.LogicStruct[]>;
}

export interface LogicClassInterface {
  new (...args: any[]): Logic;
  id: string;
  protocolId: string;
  rid: string;
  supportedChainIds: number[];
}
