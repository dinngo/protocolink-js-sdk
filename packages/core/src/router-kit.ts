import { Agent__factory, Permit2__factory, Router as RouterContract, Router__factory } from './contracts';
import { AllowanceTransfer, MaxUint160, PermitBatch, PermitDetails, PermitSingle } from '@uniswap/permit2-sdk';
import { BigNumberish, BytesLike } from 'ethers';
import { DataType, RouterInterface } from './contracts/Router';
import { IAllowanceTransfer, Permit2Interface } from './contracts/Permit2';
import { LOGIC_BATCH_TYPED_DATA_TYPES, PERMIT_EXPIRATION, PERMIT_SIG_DEADLINE } from './constants';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import * as common from '@protocolink/common';
import { getContractAddress } from './configs';
import { getDeadline, isPermitSingle } from './router-utils';

const agentImplementationAddressMap: Record<number, string> = {};
const defaultCollectorMap: Record<number, string> = {};
const defaultReferralMap: Record<number, string> = {};
const permit2AddressMap: Record<number, string> = {};
const agentMap: Record<number, Record<string, string>> = {};

export class RouterKit extends common.Web3Toolkit {
  private _routerIface?: RouterInterface;

  get routerIface() {
    if (!this._routerIface) {
      this._routerIface = Router__factory.createInterface();
    }
    return this._routerIface;
  }

  private _router?: RouterContract;

  get router() {
    if (!this._router) {
      this._router = Router__factory.connect(getContractAddress(this.chainId, 'Router'), this.provider);
    }
    return this._router;
  }

  async getAgentImplementationAddress() {
    if (!agentImplementationAddressMap[this.chainId]) {
      agentImplementationAddressMap[this.chainId] = await this.router.agentImplementation();
    }

    return agentImplementationAddressMap[this.chainId];
  }

  async getDefaultCollector() {
    if (!defaultCollectorMap[this.chainId]) {
      defaultCollectorMap[this.chainId] = await this.router.defaultCollector();
    }

    return defaultCollectorMap[this.chainId];
  }

  async getDefaultReferral() {
    if (!defaultReferralMap[this.chainId]) {
      defaultReferralMap[this.chainId] = await this.router.defaultReferral();
    }

    return defaultReferralMap[this.chainId];
  }

  async getPermit2Address() {
    if (!permit2AddressMap[this.chainId]) {
      const agentImplementationAddress = await this.getAgentImplementationAddress();
      const agentImplementation = Agent__factory.connect(agentImplementationAddress, this.provider);
      permit2AddressMap[this.chainId] = await agentImplementation.permit2();
    }

    return permit2AddressMap[this.chainId];
  }

  private _permit2Iface?: Permit2Interface;

  get permit2Iface() {
    if (!this._permit2Iface) {
      this._permit2Iface = Permit2__factory.createInterface();
    }
    return this._permit2Iface;
  }

  async calcAgent(account: string) {
    if (!agentMap[this.chainId]?.[account]) {
      const agent = await this.router.calcAgent(account);
      if (agentMap[this.chainId]) {
        agentMap[this.chainId][account] = agent;
      } else {
        agentMap[this.chainId] = { [account]: agent };
      }
    }

    return agentMap[this.chainId][account];
  }

  async getPermit2PermitData(account: string, inputs: common.TokenAmounts) {
    const agent = await this.calcAgent(account);
    const permit2Address = await this.getPermit2Address();
    const sigDeadline = getDeadline(PERMIT_SIG_DEADLINE);

    const details: PermitDetails[] = [];
    if (!inputs.isEmpty) {
      const calls: common.Multicall3.CallStruct[] = inputs.map((fund) => ({
        target: permit2Address,
        callData: this.permit2Iface.encodeFunctionData('allowance', [account, fund.token.address, agent]),
      }));
      const { returnData } = await this.multicall3.callStatic.aggregate(calls);

      inputs.forEach((fund, i) => {
        const [amount, expiration, nonce] = this.permit2Iface.decodeFunctionResult('allowance', returnData[i]);
        if (amount.lt(fund.amountWei) || expiration <= sigDeadline) {
          details.push({
            token: fund.token.address,
            amount: MaxUint160.toHexString(),
            expiration: getDeadline(PERMIT_EXPIRATION),
            nonce,
          });
        }
      });
    }
    if (details.length === 0) return;

    const permit: PermitSingle | PermitBatch =
      details.length === 1
        ? { details: details[0], spender: agent, sigDeadline }
        : { details: details, spender: agent, sigDeadline };
    const permitData = AllowanceTransfer.getPermitData(permit, permit2Address, this.chainId);

    return permitData;
  }

  async getPermit2Approvals(account: string, inputs: common.TokenAmounts) {
    const approvals: common.TransactionRequest[] = [];
    if (!inputs.isEmpty) {
      const agent = await this.calcAgent(account);
      const permit2Address = await this.getPermit2Address();

      const calls: common.Multicall3.CallStruct[] = inputs.map((fund) => ({
        target: permit2Address,
        callData: this.permit2Iface.encodeFunctionData('allowance', [account, fund.token.address, agent]),
      }));
      const { returnData } = await this.multicall3.callStatic.aggregate(calls);

      inputs.forEach((fund, i) => {
        const [amount, expiration] = this.permit2Iface.decodeFunctionResult('allowance', returnData[i]);
        if (amount.lt(fund.amountWei) || expiration <= getDeadline(PERMIT_SIG_DEADLINE)) {
          approvals.push({
            to: permit2Address,
            data: this.permit2Iface.encodeFunctionData('approve', [
              fund.token.address,
              agent,
              MaxUint160.toHexString(),
              getDeadline(PERMIT_EXPIRATION),
            ]),
          });
        }
      });
    }

    return approvals;
  }

  encodePermit2Permit(account: string, permit: PermitSingle | PermitBatch, sig: string) {
    let data: string;
    if (isPermitSingle(permit)) {
      data = this.permit2Iface.encodeFunctionData(
        'permit(address,((address,uint160,uint48,uint48),address,uint256),bytes)',
        [account, permit, sig]
      );
    } else {
      data = this.permit2Iface.encodeFunctionData(
        'permit(address,((address,uint160,uint48,uint48)[],address,uint256),bytes)',
        [account, permit, sig]
      );
    }

    return data;
  }

  async encodePermit2TransferFrom(account: string, inputs: common.TokenAmounts) {
    const agent = await this.calcAgent(account);

    let data: string;
    if (inputs.length === 1) {
      const input = inputs.at(0);
      data = this.permit2Iface.encodeFunctionData('transferFrom(address,address,uint160,address)', [
        account,
        agent,
        input.amountWei,
        input.token.address,
      ]);
    } else {
      const details: IAllowanceTransfer.AllowanceTransferDetailsStruct[] = inputs.map((input) => ({
        from: account,
        to: agent,
        amount: input.amountWei,
        token: input.token.address,
      }));
      data = this.permit2Iface.encodeFunctionData('transferFrom((address,address,uint160,address)[])', [details]);
    }

    return data;
  }

  buildLogicBatchTypedData(values: DataType.LogicBatchStruct) {
    const typedData: {
      domain: TypedDataDomain;
      types: Record<string, TypedDataField[]>;
      values: DataType.LogicBatchStruct;
    } = {
      domain: { name: 'Protocolink', version: '1', chainId: this.chainId, verifyingContract: this.router.address },
      types: LOGIC_BATCH_TYPED_DATA_TYPES,
      values,
    };

    return typedData;
  }

  buildExecuteTransactionRequest(options: {
    permit2Datas?: string[];
    routerLogics: DataType.LogicStruct[];
    tokensReturn?: string[];
    value?: BigNumberish;
  }): common.TransactionRequest {
    const { permit2Datas = [], routerLogics, tokensReturn = [], value = 0 } = options;
    const data = this.routerIface.encodeFunctionData('execute', [permit2Datas, routerLogics, tokensReturn]);

    return { to: this.router.address, data, value };
  }

  buildExecuteWithSignerFeeTransactionRequest(options: {
    permit2Datas?: string[];
    routerBatchLogics: DataType.LogicBatchStruct;
    signer: string;
    signature: BytesLike;
    tokensReturn?: string[];
    value?: BigNumberish;
    referralCode?: number;
  }): common.TransactionRequest {
    const { permit2Datas = [], routerBatchLogics, signer, signature, tokensReturn = [], value = 0 } = options;
    const data = this.routerIface.encodeFunctionData('executeWithSignerFee', [
      permit2Datas,
      routerBatchLogics,
      signer,
      signature,
      tokensReturn,
    ]);

    return { to: this.router.address, data, value };
  }
}
