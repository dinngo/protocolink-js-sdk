import { BigNumber, providers, utils } from 'ethers';
import { ELASTIC_ADDRESS, Token, TokenAmount, TokenOrAddress, isTokenObject } from './tokens';
import { ERC20__factory, Multicall2, Multicall2__factory } from './contracts';
import { Network, getNetwork } from './networks';

export class Web3Toolkit {
  readonly chainId: number;
  readonly network: Network;
  readonly provider: providers.Provider;
  readonly nativeToken: Token;
  readonly wrappedNativeToken: Token;

  constructor(chainId: number, provider?: providers.Provider) {
    this.chainId = chainId;
    this.network = getNetwork(chainId);
    this.provider = provider ? provider : new providers.JsonRpcProvider(this.network.rpcUrl);
    this.nativeToken = new Token(this.network.nativeToken);
    this.wrappedNativeToken = new Token(this.network.wrappedNativeToken);
  }

  get multicall2() {
    return Multicall2__factory.connect(this.network.multicall2Address, this.provider);
  }

  async getToken(tokenOrAddress: TokenOrAddress) {
    let token: Token;
    if (typeof tokenOrAddress === 'string') {
      const tokenAddress = tokenOrAddress;
      if (tokenAddress === this.nativeToken.address || tokenAddress === ELASTIC_ADDRESS) {
        token = this.nativeToken;
      } else {
        const iface = ERC20__factory.createInterface();
        const calls: Multicall2.CallStruct[] = [
          { target: tokenAddress, callData: iface.encodeFunctionData('decimals') },
          { target: tokenAddress, callData: iface.encodeFunctionData('symbol') },
          { target: tokenAddress, callData: iface.encodeFunctionData('name') },
        ];
        const { returnData } = await this.multicall2.callStatic.aggregate(calls);

        const [decimals] = iface.decodeFunctionResult('decimals', returnData[0]);

        let symbol: string;
        let name: string;
        try {
          [symbol] = iface.decodeFunctionResult('symbol', returnData[1]);
          [name] = iface.decodeFunctionResult('name', returnData[2]);
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
    const iface = ERC20__factory.createInterface();
    const calls: Multicall2.CallStruct[] = [];
    for (const tokenAddress of tokenAddresses) {
      if (tokenAddress !== this.nativeToken.address && tokenAddress !== ELASTIC_ADDRESS) {
        calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('decimals') });
        calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('symbol') });
        calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('name') });
      }
    }
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

    const tokens: Token[] = [];
    let j = 0;
    for (const tokenAddress of tokenAddresses) {
      if (tokenAddress === this.nativeToken.address || tokenAddress === ELASTIC_ADDRESS) {
        tokens.push(this.nativeToken);
      } else {
        const [decimals] = iface.decodeFunctionResult('decimals', returnData[j]);
        j++;
        let symbol: string;
        let name: string;
        try {
          [symbol] = iface.decodeFunctionResult('symbol', returnData[j]);
          j++;
          [name] = iface.decodeFunctionResult('name', returnData[j]);
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
    const iface = ERC20__factory.createInterface();
    const calls: Multicall2.CallStruct[] = tokenOrAddresses.map((tokenOrAddress) => ({
      target: Token.getAddress(tokenOrAddress),
      callData: iface.encodeFunctionData('allowance', [account, spender]),
    }));
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

    const allowances: BigNumber[] = [];
    for (let i = 0; i < tokenOrAddresses.length; i++) {
      const [allowance] = iface.decodeFunctionResult('allowance', returnData[i]);
      allowances.push(allowance);
    }

    return allowances;
  }
}
