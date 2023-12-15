/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers';
import type { FunctionFragment, Result } from '@ethersproject/abi';
import type { Listener, Provider } from '@ethersproject/providers';
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from './common';

export declare namespace DataTypes {
  export type ReserveConfigurationMapStruct = { data: BigNumberish };

  export type ReserveConfigurationMapStructOutput = [BigNumber] & {
    data: BigNumber;
  };

  export type ReserveDataStruct = {
    configuration: DataTypes.ReserveConfigurationMapStruct;
    liquidityIndex: BigNumberish;
    variableBorrowIndex: BigNumberish;
    currentLiquidityRate: BigNumberish;
    currentVariableBorrowRate: BigNumberish;
    currentStableBorrowRate: BigNumberish;
    lastUpdateTimestamp: BigNumberish;
    aTokenAddress: string;
    stableDebtTokenAddress: string;
    variableDebtTokenAddress: string;
    interestRateStrategyAddress: string;
    id: BigNumberish;
  };

  export type ReserveDataStructOutput = [
    DataTypes.ReserveConfigurationMapStructOutput,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    number,
    string,
    string,
    string,
    string,
    number
  ] & {
    configuration: DataTypes.ReserveConfigurationMapStructOutput;
    liquidityIndex: BigNumber;
    variableBorrowIndex: BigNumber;
    currentLiquidityRate: BigNumber;
    currentVariableBorrowRate: BigNumber;
    currentStableBorrowRate: BigNumber;
    lastUpdateTimestamp: number;
    aTokenAddress: string;
    stableDebtTokenAddress: string;
    variableDebtTokenAddress: string;
    interestRateStrategyAddress: string;
    id: number;
  };
}

export interface LendingPoolInterface extends utils.Interface {
  functions: {
    'FLASHLOAN_PREMIUM_TOTAL()': FunctionFragment;
    'getReserveData(address)': FunctionFragment;
    'getUserAccountData(address)': FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: 'FLASHLOAN_PREMIUM_TOTAL' | 'getReserveData' | 'getUserAccountData'
  ): FunctionFragment;

  encodeFunctionData(functionFragment: 'FLASHLOAN_PREMIUM_TOTAL', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getReserveData', values: [string]): string;
  encodeFunctionData(functionFragment: 'getUserAccountData', values: [string]): string;

  decodeFunctionResult(functionFragment: 'FLASHLOAN_PREMIUM_TOTAL', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getReserveData', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getUserAccountData', data: BytesLike): Result;

  events: {};
}

export interface LendingPool extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: LendingPoolInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    FLASHLOAN_PREMIUM_TOTAL(overrides?: CallOverrides): Promise<[BigNumber]>;

    getReserveData(asset: string, overrides?: CallOverrides): Promise<[DataTypes.ReserveDataStructOutput]>;

    getUserAccountData(
      user: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        totalCollateralETH: BigNumber;
        totalDebtETH: BigNumber;
        availableBorrowsETH: BigNumber;
        currentLiquidationThreshold: BigNumber;
        ltv: BigNumber;
        healthFactor: BigNumber;
      }
    >;
  };

  FLASHLOAN_PREMIUM_TOTAL(overrides?: CallOverrides): Promise<BigNumber>;

  getReserveData(asset: string, overrides?: CallOverrides): Promise<DataTypes.ReserveDataStructOutput>;

  getUserAccountData(
    user: string,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      totalCollateralETH: BigNumber;
      totalDebtETH: BigNumber;
      availableBorrowsETH: BigNumber;
      currentLiquidationThreshold: BigNumber;
      ltv: BigNumber;
      healthFactor: BigNumber;
    }
  >;

  callStatic: {
    FLASHLOAN_PREMIUM_TOTAL(overrides?: CallOverrides): Promise<BigNumber>;

    getReserveData(asset: string, overrides?: CallOverrides): Promise<DataTypes.ReserveDataStructOutput>;

    getUserAccountData(
      user: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        totalCollateralETH: BigNumber;
        totalDebtETH: BigNumber;
        availableBorrowsETH: BigNumber;
        currentLiquidationThreshold: BigNumber;
        ltv: BigNumber;
        healthFactor: BigNumber;
      }
    >;
  };

  filters: {};

  estimateGas: {
    FLASHLOAN_PREMIUM_TOTAL(overrides?: CallOverrides): Promise<BigNumber>;

    getReserveData(asset: string, overrides?: CallOverrides): Promise<BigNumber>;

    getUserAccountData(user: string, overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    FLASHLOAN_PREMIUM_TOTAL(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getReserveData(asset: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getUserAccountData(user: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}