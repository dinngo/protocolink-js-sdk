/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers';
import type { FunctionFragment, Result, EventFragment } from '@ethersproject/abi';
import type { Listener, Provider } from '@ethersproject/providers';
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from './common';

export interface ATokenInterface extends utils.Interface {
  functions: {
    'ATOKEN_REVISION()': FunctionFragment;
    'DOMAIN_SEPARATOR()': FunctionFragment;
    'EIP712_REVISION()': FunctionFragment;
    'PERMIT_TYPEHASH()': FunctionFragment;
    'POOL()': FunctionFragment;
    'RESERVE_TREASURY_ADDRESS()': FunctionFragment;
    'UNDERLYING_ASSET_ADDRESS()': FunctionFragment;
    'allowance(address,address)': FunctionFragment;
    'approve(address,uint256)': FunctionFragment;
    'balanceOf(address)': FunctionFragment;
    'burn(address,address,uint256,uint256)': FunctionFragment;
    'decimals()': FunctionFragment;
    'decreaseAllowance(address,uint256)': FunctionFragment;
    'getIncentivesController()': FunctionFragment;
    'getPreviousIndex(address)': FunctionFragment;
    'getScaledUserBalanceAndSupply(address)': FunctionFragment;
    'handleRepayment(address,address,uint256)': FunctionFragment;
    'increaseAllowance(address,uint256)': FunctionFragment;
    'initialize(address,address,address,address,uint8,string,string,bytes)': FunctionFragment;
    'mint(address,address,uint256,uint256)': FunctionFragment;
    'mintToTreasury(uint256,uint256)': FunctionFragment;
    'name()': FunctionFragment;
    'nonces(address)': FunctionFragment;
    'permit(address,address,uint256,uint256,uint8,bytes32,bytes32)': FunctionFragment;
    'rescueTokens(address,address,uint256)': FunctionFragment;
    'scaledBalanceOf(address)': FunctionFragment;
    'scaledTotalSupply()': FunctionFragment;
    'setIncentivesController(address)': FunctionFragment;
    'symbol()': FunctionFragment;
    'totalSupply()': FunctionFragment;
    'transfer(address,uint256)': FunctionFragment;
    'transferFrom(address,address,uint256)': FunctionFragment;
    'transferOnLiquidation(address,address,uint256)': FunctionFragment;
    'transferUnderlyingTo(address,uint256)': FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | 'ATOKEN_REVISION'
      | 'DOMAIN_SEPARATOR'
      | 'EIP712_REVISION'
      | 'PERMIT_TYPEHASH'
      | 'POOL'
      | 'RESERVE_TREASURY_ADDRESS'
      | 'UNDERLYING_ASSET_ADDRESS'
      | 'allowance'
      | 'approve'
      | 'balanceOf'
      | 'burn'
      | 'decimals'
      | 'decreaseAllowance'
      | 'getIncentivesController'
      | 'getPreviousIndex'
      | 'getScaledUserBalanceAndSupply'
      | 'handleRepayment'
      | 'increaseAllowance'
      | 'initialize'
      | 'mint'
      | 'mintToTreasury'
      | 'name'
      | 'nonces'
      | 'permit'
      | 'rescueTokens'
      | 'scaledBalanceOf'
      | 'scaledTotalSupply'
      | 'setIncentivesController'
      | 'symbol'
      | 'totalSupply'
      | 'transfer'
      | 'transferFrom'
      | 'transferOnLiquidation'
      | 'transferUnderlyingTo'
  ): FunctionFragment;

  encodeFunctionData(functionFragment: 'ATOKEN_REVISION', values?: undefined): string;
  encodeFunctionData(functionFragment: 'DOMAIN_SEPARATOR', values?: undefined): string;
  encodeFunctionData(functionFragment: 'EIP712_REVISION', values?: undefined): string;
  encodeFunctionData(functionFragment: 'PERMIT_TYPEHASH', values?: undefined): string;
  encodeFunctionData(functionFragment: 'POOL', values?: undefined): string;
  encodeFunctionData(functionFragment: 'RESERVE_TREASURY_ADDRESS', values?: undefined): string;
  encodeFunctionData(functionFragment: 'UNDERLYING_ASSET_ADDRESS', values?: undefined): string;
  encodeFunctionData(functionFragment: 'allowance', values: [string, string]): string;
  encodeFunctionData(functionFragment: 'approve', values: [string, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'balanceOf', values: [string]): string;
  encodeFunctionData(functionFragment: 'burn', values: [string, string, BigNumberish, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'decimals', values?: undefined): string;
  encodeFunctionData(functionFragment: 'decreaseAllowance', values: [string, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'getIncentivesController', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getPreviousIndex', values: [string]): string;
  encodeFunctionData(functionFragment: 'getScaledUserBalanceAndSupply', values: [string]): string;
  encodeFunctionData(functionFragment: 'handleRepayment', values: [string, string, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'increaseAllowance', values: [string, BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'initialize',
    values: [string, string, string, string, BigNumberish, string, string, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: 'mint', values: [string, string, BigNumberish, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'mintToTreasury', values: [BigNumberish, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'name', values?: undefined): string;
  encodeFunctionData(functionFragment: 'nonces', values: [string]): string;
  encodeFunctionData(
    functionFragment: 'permit',
    values: [string, string, BigNumberish, BigNumberish, BigNumberish, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: 'rescueTokens', values: [string, string, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'scaledBalanceOf', values: [string]): string;
  encodeFunctionData(functionFragment: 'scaledTotalSupply', values?: undefined): string;
  encodeFunctionData(functionFragment: 'setIncentivesController', values: [string]): string;
  encodeFunctionData(functionFragment: 'symbol', values?: undefined): string;
  encodeFunctionData(functionFragment: 'totalSupply', values?: undefined): string;
  encodeFunctionData(functionFragment: 'transfer', values: [string, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'transferFrom', values: [string, string, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'transferOnLiquidation', values: [string, string, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'transferUnderlyingTo', values: [string, BigNumberish]): string;

  decodeFunctionResult(functionFragment: 'ATOKEN_REVISION', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'DOMAIN_SEPARATOR', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'EIP712_REVISION', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'PERMIT_TYPEHASH', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'POOL', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'RESERVE_TREASURY_ADDRESS', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'UNDERLYING_ASSET_ADDRESS', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'allowance', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'approve', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'balanceOf', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'burn', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'decimals', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'decreaseAllowance', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getIncentivesController', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getPreviousIndex', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getScaledUserBalanceAndSupply', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'handleRepayment', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'increaseAllowance', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'initialize', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'mint', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'mintToTreasury', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'name', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'nonces', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'permit', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'rescueTokens', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'scaledBalanceOf', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'scaledTotalSupply', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setIncentivesController', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'symbol', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'totalSupply', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transfer', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferFrom', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferOnLiquidation', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferUnderlyingTo', data: BytesLike): Result;

  events: {
    'Approval(address,address,uint256)': EventFragment;
    'BalanceTransfer(address,address,uint256,uint256)': EventFragment;
    'Burn(address,address,uint256,uint256,uint256)': EventFragment;
    'Initialized(address,address,address,address,uint8,string,string,bytes)': EventFragment;
    'Mint(address,address,uint256,uint256,uint256)': EventFragment;
    'Transfer(address,address,uint256)': EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: 'Approval'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'BalanceTransfer'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'Burn'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'Initialized'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'Mint'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'Transfer'): EventFragment;
}

export interface ApprovalEventObject {
  owner: string;
  spender: string;
  value: BigNumber;
}
export type ApprovalEvent = TypedEvent<[string, string, BigNumber], ApprovalEventObject>;

export type ApprovalEventFilter = TypedEventFilter<ApprovalEvent>;

export interface BalanceTransferEventObject {
  from: string;
  to: string;
  value: BigNumber;
  index: BigNumber;
}
export type BalanceTransferEvent = TypedEvent<[string, string, BigNumber, BigNumber], BalanceTransferEventObject>;

export type BalanceTransferEventFilter = TypedEventFilter<BalanceTransferEvent>;

export interface BurnEventObject {
  from: string;
  target: string;
  value: BigNumber;
  balanceIncrease: BigNumber;
  index: BigNumber;
}
export type BurnEvent = TypedEvent<[string, string, BigNumber, BigNumber, BigNumber], BurnEventObject>;

export type BurnEventFilter = TypedEventFilter<BurnEvent>;

export interface InitializedEventObject {
  underlyingAsset: string;
  pool: string;
  treasury: string;
  incentivesController: string;
  aTokenDecimals: number;
  aTokenName: string;
  aTokenSymbol: string;
  params: string;
}
export type InitializedEvent = TypedEvent<
  [string, string, string, string, number, string, string, string],
  InitializedEventObject
>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface MintEventObject {
  caller: string;
  onBehalfOf: string;
  value: BigNumber;
  balanceIncrease: BigNumber;
  index: BigNumber;
}
export type MintEvent = TypedEvent<[string, string, BigNumber, BigNumber, BigNumber], MintEventObject>;

export type MintEventFilter = TypedEventFilter<MintEvent>;

export interface TransferEventObject {
  from: string;
  to: string;
  value: BigNumber;
}
export type TransferEvent = TypedEvent<[string, string, BigNumber], TransferEventObject>;

export type TransferEventFilter = TypedEventFilter<TransferEvent>;

export interface AToken extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ATokenInterface;

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
    ATOKEN_REVISION(overrides?: CallOverrides): Promise<[BigNumber]>;

    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<[string]>;

    EIP712_REVISION(overrides?: CallOverrides): Promise<[string]>;

    PERMIT_TYPEHASH(overrides?: CallOverrides): Promise<[string]>;

    POOL(overrides?: CallOverrides): Promise<[string]>;

    RESERVE_TREASURY_ADDRESS(overrides?: CallOverrides): Promise<[string]>;

    UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<[string]>;

    allowance(owner: string, spender: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    approve(
      spender: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    balanceOf(user: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    burn(
      from: string,
      receiverOfUnderlying: string,
      amount: BigNumberish,
      index: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    decimals(overrides?: CallOverrides): Promise<[number]>;

    decreaseAllowance(
      spender: string,
      subtractedValue: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    getIncentivesController(overrides?: CallOverrides): Promise<[string]>;

    getPreviousIndex(user: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    getScaledUserBalanceAndSupply(user: string, overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;

    handleRepayment(
      user: string,
      onBehalfOf: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    increaseAllowance(
      spender: string,
      addedValue: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    initialize(
      initializingPool: string,
      treasury: string,
      underlyingAsset: string,
      incentivesController: string,
      aTokenDecimals: BigNumberish,
      aTokenName: string,
      aTokenSymbol: string,
      params: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    mint(
      caller: string,
      onBehalfOf: string,
      amount: BigNumberish,
      index: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    mintToTreasury(
      amount: BigNumberish,
      index: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    name(overrides?: CallOverrides): Promise<[string]>;

    nonces(owner: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    permit(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    rescueTokens(
      token: string,
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    scaledBalanceOf(user: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    scaledTotalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    setIncentivesController(
      controller: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    symbol(overrides?: CallOverrides): Promise<[string]>;

    totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    transfer(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    transferFrom(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    transferOnLiquidation(
      from: string,
      to: string,
      value: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    transferUnderlyingTo(
      target: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  ATOKEN_REVISION(overrides?: CallOverrides): Promise<BigNumber>;

  DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<string>;

  EIP712_REVISION(overrides?: CallOverrides): Promise<string>;

  PERMIT_TYPEHASH(overrides?: CallOverrides): Promise<string>;

  POOL(overrides?: CallOverrides): Promise<string>;

  RESERVE_TREASURY_ADDRESS(overrides?: CallOverrides): Promise<string>;

  UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<string>;

  allowance(owner: string, spender: string, overrides?: CallOverrides): Promise<BigNumber>;

  approve(
    spender: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  balanceOf(user: string, overrides?: CallOverrides): Promise<BigNumber>;

  burn(
    from: string,
    receiverOfUnderlying: string,
    amount: BigNumberish,
    index: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  decimals(overrides?: CallOverrides): Promise<number>;

  decreaseAllowance(
    spender: string,
    subtractedValue: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  getIncentivesController(overrides?: CallOverrides): Promise<string>;

  getPreviousIndex(user: string, overrides?: CallOverrides): Promise<BigNumber>;

  getScaledUserBalanceAndSupply(user: string, overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;

  handleRepayment(
    user: string,
    onBehalfOf: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  increaseAllowance(
    spender: string,
    addedValue: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  initialize(
    initializingPool: string,
    treasury: string,
    underlyingAsset: string,
    incentivesController: string,
    aTokenDecimals: BigNumberish,
    aTokenName: string,
    aTokenSymbol: string,
    params: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  mint(
    caller: string,
    onBehalfOf: string,
    amount: BigNumberish,
    index: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  mintToTreasury(
    amount: BigNumberish,
    index: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  name(overrides?: CallOverrides): Promise<string>;

  nonces(owner: string, overrides?: CallOverrides): Promise<BigNumber>;

  permit(
    owner: string,
    spender: string,
    value: BigNumberish,
    deadline: BigNumberish,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  rescueTokens(
    token: string,
    to: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  scaledBalanceOf(user: string, overrides?: CallOverrides): Promise<BigNumber>;

  scaledTotalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  setIncentivesController(controller: string, overrides?: Overrides & { from?: string }): Promise<ContractTransaction>;

  symbol(overrides?: CallOverrides): Promise<string>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  transfer(
    recipient: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  transferFrom(
    sender: string,
    recipient: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  transferOnLiquidation(
    from: string,
    to: string,
    value: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  transferUnderlyingTo(
    target: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    ATOKEN_REVISION(overrides?: CallOverrides): Promise<BigNumber>;

    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<string>;

    EIP712_REVISION(overrides?: CallOverrides): Promise<string>;

    PERMIT_TYPEHASH(overrides?: CallOverrides): Promise<string>;

    POOL(overrides?: CallOverrides): Promise<string>;

    RESERVE_TREASURY_ADDRESS(overrides?: CallOverrides): Promise<string>;

    UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<string>;

    allowance(owner: string, spender: string, overrides?: CallOverrides): Promise<BigNumber>;

    approve(spender: string, amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;

    balanceOf(user: string, overrides?: CallOverrides): Promise<BigNumber>;

    burn(
      from: string,
      receiverOfUnderlying: string,
      amount: BigNumberish,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    decimals(overrides?: CallOverrides): Promise<number>;

    decreaseAllowance(spender: string, subtractedValue: BigNumberish, overrides?: CallOverrides): Promise<boolean>;

    getIncentivesController(overrides?: CallOverrides): Promise<string>;

    getPreviousIndex(user: string, overrides?: CallOverrides): Promise<BigNumber>;

    getScaledUserBalanceAndSupply(user: string, overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;

    handleRepayment(user: string, onBehalfOf: string, amount: BigNumberish, overrides?: CallOverrides): Promise<void>;

    increaseAllowance(spender: string, addedValue: BigNumberish, overrides?: CallOverrides): Promise<boolean>;

    initialize(
      initializingPool: string,
      treasury: string,
      underlyingAsset: string,
      incentivesController: string,
      aTokenDecimals: BigNumberish,
      aTokenName: string,
      aTokenSymbol: string,
      params: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    mint(
      caller: string,
      onBehalfOf: string,
      amount: BigNumberish,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    mintToTreasury(amount: BigNumberish, index: BigNumberish, overrides?: CallOverrides): Promise<void>;

    name(overrides?: CallOverrides): Promise<string>;

    nonces(owner: string, overrides?: CallOverrides): Promise<BigNumber>;

    permit(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    rescueTokens(token: string, to: string, amount: BigNumberish, overrides?: CallOverrides): Promise<void>;

    scaledBalanceOf(user: string, overrides?: CallOverrides): Promise<BigNumber>;

    scaledTotalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    setIncentivesController(controller: string, overrides?: CallOverrides): Promise<void>;

    symbol(overrides?: CallOverrides): Promise<string>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(recipient: string, amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;

    transferFrom(sender: string, recipient: string, amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;

    transferOnLiquidation(from: string, to: string, value: BigNumberish, overrides?: CallOverrides): Promise<void>;

    transferUnderlyingTo(target: string, amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    'Approval(address,address,uint256)'(
      owner?: string | null,
      spender?: string | null,
      value?: null
    ): ApprovalEventFilter;
    Approval(owner?: string | null, spender?: string | null, value?: null): ApprovalEventFilter;

    'BalanceTransfer(address,address,uint256,uint256)'(
      from?: string | null,
      to?: string | null,
      value?: null,
      index?: null
    ): BalanceTransferEventFilter;
    BalanceTransfer(from?: string | null, to?: string | null, value?: null, index?: null): BalanceTransferEventFilter;

    'Burn(address,address,uint256,uint256,uint256)'(
      from?: string | null,
      target?: string | null,
      value?: null,
      balanceIncrease?: null,
      index?: null
    ): BurnEventFilter;
    Burn(
      from?: string | null,
      target?: string | null,
      value?: null,
      balanceIncrease?: null,
      index?: null
    ): BurnEventFilter;

    'Initialized(address,address,address,address,uint8,string,string,bytes)'(
      underlyingAsset?: string | null,
      pool?: string | null,
      treasury?: null,
      incentivesController?: null,
      aTokenDecimals?: null,
      aTokenName?: null,
      aTokenSymbol?: null,
      params?: null
    ): InitializedEventFilter;
    Initialized(
      underlyingAsset?: string | null,
      pool?: string | null,
      treasury?: null,
      incentivesController?: null,
      aTokenDecimals?: null,
      aTokenName?: null,
      aTokenSymbol?: null,
      params?: null
    ): InitializedEventFilter;

    'Mint(address,address,uint256,uint256,uint256)'(
      caller?: string | null,
      onBehalfOf?: string | null,
      value?: null,
      balanceIncrease?: null,
      index?: null
    ): MintEventFilter;
    Mint(
      caller?: string | null,
      onBehalfOf?: string | null,
      value?: null,
      balanceIncrease?: null,
      index?: null
    ): MintEventFilter;

    'Transfer(address,address,uint256)'(from?: string | null, to?: string | null, value?: null): TransferEventFilter;
    Transfer(from?: string | null, to?: string | null, value?: null): TransferEventFilter;
  };

  estimateGas: {
    ATOKEN_REVISION(overrides?: CallOverrides): Promise<BigNumber>;

    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<BigNumber>;

    EIP712_REVISION(overrides?: CallOverrides): Promise<BigNumber>;

    PERMIT_TYPEHASH(overrides?: CallOverrides): Promise<BigNumber>;

    POOL(overrides?: CallOverrides): Promise<BigNumber>;

    RESERVE_TREASURY_ADDRESS(overrides?: CallOverrides): Promise<BigNumber>;

    UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<BigNumber>;

    allowance(owner: string, spender: string, overrides?: CallOverrides): Promise<BigNumber>;

    approve(spender: string, amount: BigNumberish, overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    balanceOf(user: string, overrides?: CallOverrides): Promise<BigNumber>;

    burn(
      from: string,
      receiverOfUnderlying: string,
      amount: BigNumberish,
      index: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    decimals(overrides?: CallOverrides): Promise<BigNumber>;

    decreaseAllowance(
      spender: string,
      subtractedValue: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    getIncentivesController(overrides?: CallOverrides): Promise<BigNumber>;

    getPreviousIndex(user: string, overrides?: CallOverrides): Promise<BigNumber>;

    getScaledUserBalanceAndSupply(user: string, overrides?: CallOverrides): Promise<BigNumber>;

    handleRepayment(
      user: string,
      onBehalfOf: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    increaseAllowance(
      spender: string,
      addedValue: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    initialize(
      initializingPool: string,
      treasury: string,
      underlyingAsset: string,
      incentivesController: string,
      aTokenDecimals: BigNumberish,
      aTokenName: string,
      aTokenSymbol: string,
      params: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    mint(
      caller: string,
      onBehalfOf: string,
      amount: BigNumberish,
      index: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    mintToTreasury(
      amount: BigNumberish,
      index: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<BigNumber>;

    nonces(owner: string, overrides?: CallOverrides): Promise<BigNumber>;

    permit(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    rescueTokens(
      token: string,
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    scaledBalanceOf(user: string, overrides?: CallOverrides): Promise<BigNumber>;

    scaledTotalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    setIncentivesController(controller: string, overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    symbol(overrides?: CallOverrides): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(recipient: string, amount: BigNumberish, overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    transferFrom(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    transferOnLiquidation(
      from: string,
      to: string,
      value: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    transferUnderlyingTo(
      target: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ATOKEN_REVISION(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    EIP712_REVISION(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    PERMIT_TYPEHASH(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    POOL(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    RESERVE_TREASURY_ADDRESS(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    allowance(owner: string, spender: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    approve(
      spender: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    balanceOf(user: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    burn(
      from: string,
      receiverOfUnderlying: string,
      amount: BigNumberish,
      index: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    decreaseAllowance(
      spender: string,
      subtractedValue: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    getIncentivesController(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getPreviousIndex(user: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getScaledUserBalanceAndSupply(user: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    handleRepayment(
      user: string,
      onBehalfOf: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    increaseAllowance(
      spender: string,
      addedValue: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    initialize(
      initializingPool: string,
      treasury: string,
      underlyingAsset: string,
      incentivesController: string,
      aTokenDecimals: BigNumberish,
      aTokenName: string,
      aTokenSymbol: string,
      params: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    mint(
      caller: string,
      onBehalfOf: string,
      amount: BigNumberish,
      index: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    mintToTreasury(
      amount: BigNumberish,
      index: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nonces(owner: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    permit(
      owner: string,
      spender: string,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    rescueTokens(
      token: string,
      to: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    scaledBalanceOf(user: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    scaledTotalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setIncentivesController(
      controller: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transfer(
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    transferFrom(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    transferOnLiquidation(
      from: string,
      to: string,
      value: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    transferUnderlyingTo(
      target: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
