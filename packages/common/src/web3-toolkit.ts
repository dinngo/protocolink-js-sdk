import { BigNumber, providers, utils } from 'ethers';
import { ChainId, Network, getNetwork } from './networks';
import { ELASTIC_ADDRESS, Token, TokenAmount, TokenOrAddress, isTokenObject } from './tokens';
import { ERC20Interface } from './contracts/ERC20';
import { ERC20__factory, Multicall3, Multicall3__factory } from './contracts';
import { Multicall3Interface } from './contracts/Multicall3';
import * as zk from 'zksync-web3';

export class Web3Toolkit {
  readonly chainId: number;
  readonly network: Network;
  readonly provider: providers.Provider;
  readonly nativeToken: Token;
  readonly wrappedNativeToken: Token;

  constructor(chainId: number, provider?: providers.Provider) {
    this.chainId = chainId;
    this.network = getNetwork(chainId);
    this.provider = provider
      ? provider
      : chainId === ChainId.zksync
      ? new zk.Provider(this.network.rpcUrl)
      : new providers.JsonRpcProvider(this.network.rpcUrl);
    this.nativeToken = new Token(this.network.nativeToken);
    this.wrappedNativeToken = new Token(this.network.wrappedNativeToken);
  }

  private _erc20Iface?: ERC20Interface;

  get erc20Iface() {
    if (!this._erc20Iface) {
      this._erc20Iface = ERC20__factory.createInterface();
    }
    return this._erc20Iface;
  }

  private _multicall3Iface?: Multicall3Interface;

  get multicall3Iface() {
    if (!this._multicall3Iface) {
      this._multicall3Iface = Multicall3__factory.createInterface();
    }
    return this._multicall3Iface;
  }

  private _multicall3?: Multicall3;

  get multicall3() {
    if (!this._multicall3) {
      this._multicall3 = Multicall3__factory.connect(this.network.multicall3Address, this.provider);
    }
    return this._multicall3;
  }

  async getToken(tokenOrAddress: TokenOrAddress) {
    let token: Token;
    if (typeof tokenOrAddress === 'string') {
      const tokenAddress = tokenOrAddress;
      if (tokenAddress === this.nativeToken.address || tokenAddress === ELASTIC_ADDRESS) {
        token = this.nativeToken;
      } else {
        const calls: Multicall3.CallStruct[] = [
          { target: tokenAddress, callData: this.erc20Iface.encodeFunctionData('decimals') },
          { target: tokenAddress, callData: this.erc20Iface.encodeFunctionData('symbol') },
          { target: tokenAddress, callData: this.erc20Iface.encodeFunctionData('name') },
        ];
        const { returnData } = await this.multicall3.callStatic.aggregate(calls);

        const [decimals] = this.erc20Iface.decodeFunctionResult('decimals', returnData[0]);

        let symbol: string;
        let name: string;
        try {
          [symbol] = this.erc20Iface.decodeFunctionResult('symbol', returnData[1]);
          [name] = this.erc20Iface.decodeFunctionResult('name', returnData[2]);
        } catch {
          symbol = utils.parseBytes32String(returnData[1]);
          name = utils.parseBytes32String(returnData[2]);
        }

        token = new Token(this.chainId, tokenAddress, decimals, symbol, name);
      }
    } else if (isTokenObject(tokenOrAddress)) {
      token = Token.from(tokenOrAddress);
    } else {
      token = tokenOrAddress;
    }

    return token;
  }

  async getTokens(tokenAddresses: string[]) {
    const calls: Multicall3.CallStruct[] = [];
    for (const tokenAddress of tokenAddresses) {
      if (tokenAddress !== this.nativeToken.address && tokenAddress !== ELASTIC_ADDRESS) {
        calls.push({ target: tokenAddress, callData: this.erc20Iface.encodeFunctionData('decimals') });
        calls.push({ target: tokenAddress, callData: this.erc20Iface.encodeFunctionData('symbol') });
        calls.push({ target: tokenAddress, callData: this.erc20Iface.encodeFunctionData('name') });
      }
    }
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);

    const tokens: Token[] = [];
    let j = 0;
    for (const tokenAddress of tokenAddresses) {
      if (tokenAddress === this.nativeToken.address || tokenAddress === ELASTIC_ADDRESS) {
        tokens.push(this.nativeToken);
      } else {
        const [decimals] = this.erc20Iface.decodeFunctionResult('decimals', returnData[j]);
        j++;
        let symbol: string;
        let name: string;
        try {
          [symbol] = this.erc20Iface.decodeFunctionResult('symbol', returnData[j]);
          j++;
          [name] = this.erc20Iface.decodeFunctionResult('name', returnData[j]);
          j++;
        } catch {
          symbol = utils.parseBytes32String(returnData[j]);
          j++;
          name = utils.parseBytes32String(returnData[j]);
          j++;
        }
        tokens.push(new Token(this.chainId, tokenAddress, decimals, symbol, name));
      }
    }

    return tokens;
  }

  async getBalance(account: string, tokenOrAddress: TokenOrAddress, blockTag?: providers.BlockTag) {
    const token = await this.getToken(tokenOrAddress);
    const balanceWei = token.isNative
      ? await this.provider.getBalance(account, blockTag)
      : await ERC20__factory.connect(token.address, this.provider).balanceOf(account, { blockTag });
    const balance = new TokenAmount(token).setWei(balanceWei);

    return balance;
  }

  async getAllowance(account: string, tokenOrAddress: TokenOrAddress, spender: string) {
    const erc20 = ERC20__factory.connect(Token.getAddress(tokenOrAddress), this.provider);
    const allowance = await erc20.allowance(account, spender);

    return allowance;
  }

  async getAllowances(account: string, tokenOrAddresses: TokenOrAddress[], spender: string) {
    const calls: Multicall3.CallStruct[] = tokenOrAddresses.map((tokenOrAddress) => ({
      target: Token.getAddress(tokenOrAddress),
      callData: this.erc20Iface.encodeFunctionData('allowance', [account, spender]),
    }));
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);

    const allowances: BigNumber[] = [];
    for (let i = 0; i < tokenOrAddresses.length; i++) {
      const [allowance] = this.erc20Iface.decodeFunctionResult('allowance', returnData[i]);
      allowances.push(allowance);
    }

    return allowances;
  }
}
