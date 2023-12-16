import { ATokenInterface } from './contracts/AToken';
import {
  AToken__factory,
  ETHPriceFeed,
  ETHPriceFeed__factory,
  PriceOracle,
  PriceOracle__factory,
  ProtocolDataProvider,
  ProtocolDataProvider__factory,
} from './contracts';
import { BigNumber, providers } from 'ethers';
import { BorrowObject, Market, RepayFields, SupplyObject, TokenInFields, TokenOutFields } from 'src/protocol.type';
import {
  DISPLAY_NAME,
  ID,
  configMap,
  getContractAddress,
  isAToken,
  supportedChainIds,
  toAToken,
  toToken,
  tokensForBorrowMap,
  tokensForDepositMap,
} from './configs';
import { ETHPriceFeedInterface } from './contracts/ETHPriceFeed';
import { Portfolio } from 'src/protocol.portfolio';
import { PriceOracleInterface } from './contracts/PriceOracle';
import { Protocol } from 'src/protocol';
import { ProtocolDataProviderInterface } from './contracts/ProtocolDataProvider';
import { RAY_DECIMALS, SECONDS_PER_YEAR, calculateCompoundedRate, normalize } from '@aave/math-utils';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export class LendingProtocol extends Protocol {
  static readonly markets = supportedChainIds.map((chainId) => ({
    id: common.toNetworkId(chainId),
    chainId,
  }));

  readonly id = ID;
  readonly market: Market;
  readonly isAaveLike = true;

  constructor(chainId: number, provider?: providers.Provider) {
    super(chainId, provider);
    this.market = LendingProtocol.markets.find((market) => market.chainId === this.chainId)!;
  }

  private _protocolDataProvider?: ProtocolDataProvider;

  get protocolDataProvider() {
    if (!this._protocolDataProvider) {
      this._protocolDataProvider = ProtocolDataProvider__factory.connect(
        getContractAddress(this.chainId, 'ProtocolDataProvider'),
        this.provider
      );
    }
    return this._protocolDataProvider;
  }

  private _protocolDataProviderIface?: ProtocolDataProviderInterface;

  get protocolDataProviderIface() {
    if (!this._protocolDataProviderIface) {
      this._protocolDataProviderIface = ProtocolDataProvider__factory.createInterface();
    }
    return this._protocolDataProviderIface;
  }

  private _priceOracle?: PriceOracle;

  get priceOracle() {
    if (!this._priceOracle) {
      this._priceOracle = PriceOracle__factory.connect(getContractAddress(this.chainId, 'PriceOracle'), this.provider);
    }
    return this._priceOracle;
  }

  private _priceOracleIface?: PriceOracleInterface;

  get priceOracleIface() {
    if (!this._priceOracleIface) {
      this._priceOracleIface = PriceOracle__factory.createInterface();
    }
    return this._priceOracleIface;
  }

  private _ethPriceFeed?: ETHPriceFeed;

  get ethPriceFeed() {
    if (!this._ethPriceFeed) {
      this._ethPriceFeed = ETHPriceFeed__factory.connect(
        getContractAddress(this.chainId, 'ETHPriceFeed'),
        this.provider
      );
    }
    return this._ethPriceFeed;
  }

  private _priceFeedIface?: ETHPriceFeedInterface;

  get ethPriceFeedIface() {
    if (!this._priceFeedIface) {
      this._priceFeedIface = ETHPriceFeed__factory.createInterface();
    }
    return this._priceFeedIface;
  }

  private _aTokenIface?: ATokenInterface;

  get aTokenIface() {
    if (!this._aTokenIface) {
      this._aTokenIface = AToken__factory.createInterface();
    }
    return this._aTokenIface;
  }

  get reserves() {
    return configMap[this.chainId].reserves;
  }

  getMarketName() {
    return DISPLAY_NAME;
  }

  private _reserveDataMap?: Record<
    string,
    {
      ltv: string;
      liquidationThreshold: string;
      usageAsCollateralEnabled: boolean;
      supplyAPY: string;
      stableBorrowAPY: string;
      variableBorrowAPY: string;
    }
  >;

  async getReserveDataMap() {
    if (!this._reserveDataMap) {
      const calls: common.Multicall3.CallStruct[] = [];
      for (const { asset } of this.reserves) {
        calls.push({
          target: this.protocolDataProvider.address,
          callData: this.protocolDataProviderIface.encodeFunctionData('getReserveConfigurationData', [
            asset.wrapped.address,
          ]),
        });
        calls.push({
          target: this.protocolDataProvider.address,
          callData: this.protocolDataProviderIface.encodeFunctionData('getReserveData', [asset.wrapped.address]),
        });
      }
      const { returnData } = await this.multicall3.callStatic.aggregate(calls, { blockTag: this.blockTag });

      this._reserveDataMap = {};
      let j = 0;
      for (const { asset } of this.reserves) {
        const { ltv, liquidationThreshold, usageAsCollateralEnabled } =
          this.protocolDataProviderIface.decodeFunctionResult('getReserveConfigurationData', returnData[j]);
        j++;
        const { liquidityRate, variableBorrowRate, stableBorrowRate } =
          this.protocolDataProviderIface.decodeFunctionResult('getReserveData', returnData[j]);
        j++;

        this._reserveDataMap[asset.address] = {
          ltv: common.toBigUnit(ltv, 4),
          liquidationThreshold: common.toBigUnit(liquidationThreshold, 4),
          usageAsCollateralEnabled,
          supplyAPY: normalize(
            calculateCompoundedRate({ rate: liquidityRate.toString(), duration: SECONDS_PER_YEAR }),
            RAY_DECIMALS
          ),
          stableBorrowAPY: normalize(
            calculateCompoundedRate({ rate: stableBorrowRate.toString(), duration: SECONDS_PER_YEAR }),
            RAY_DECIMALS
          ),
          variableBorrowAPY: normalize(
            calculateCompoundedRate({ rate: variableBorrowRate.toString(), duration: SECONDS_PER_YEAR }),
            RAY_DECIMALS
          ),
        };
      }
    }

    return this._reserveDataMap;
  }

  async getAssetPriceMap() {
    const calls: common.Multicall3.CallStruct[] = [
      {
        target: this.ethPriceFeed.address,
        callData: this.ethPriceFeedIface.encodeFunctionData('latestAnswer'),
      },
      {
        target: this.priceOracle.address,
        callData: this.priceOracleIface.encodeFunctionData('getAssetsPrices', [
          this.reserves.map(({ asset }) => asset.wrapped.address),
        ]),
      },
    ];
    const { returnData } = await this.multicall3.callStatic.aggregate(calls, { blockTag: this.blockTag });

    const [ethPrice] = this.ethPriceFeedIface.decodeFunctionResult('latestAnswer', returnData[0]);
    const [assetPrices] = this.priceOracleIface.decodeFunctionResult('getAssetsPrices', returnData[1]);

    const assetPriceMap: Record<string, string> = {};
    for (let i = 0; i < this.reserves.length; i++) {
      assetPriceMap[this.reserves[i].asset.address] = common.toBigUnit(
        ethPrice.mul(assetPrices[i]).div(BigNumber.from(10).pow(18)),
        8
      );
    }

    return assetPriceMap;
  }

  async getUserBalancesMap(account: string) {
    const calls: common.Multicall3.CallStruct[] = [];
    for (const { asset, aToken } of this.reserves) {
      calls.push({ target: aToken.address, callData: this.erc20Iface.encodeFunctionData('balanceOf', [account]) });
      calls.push({
        target: this.protocolDataProvider.address,
        callData: this.protocolDataProviderIface.encodeFunctionData('getUserReserveData', [
          asset.wrapped.address,
          account,
        ]),
      });
    }
    const { returnData } = await this.multicall3.callStatic.aggregate(calls, { blockTag: this.blockTag });

    const userBalancesMap: Record<
      string,
      {
        supplyBalance: string;
        stableBorrowBalance: string;
        variableBorrowBalance: string;
        usageAsCollateralEnabled: boolean;
      }
    > = {};
    let j = 0;
    for (let i = 0; i < this.reserves.length; i++) {
      const { asset } = this.reserves[i];

      const [aTokenBalance] = this.erc20Iface.decodeFunctionResult('balanceOf', returnData[j]);
      j++;

      const { currentStableDebt, currentVariableDebt, usageAsCollateralEnabled } =
        this.protocolDataProviderIface.decodeFunctionResult('getUserReserveData', returnData[j]);
      j++;

      userBalancesMap[asset.address] = {
        supplyBalance: common.toBigUnit(aTokenBalance, asset.decimals),
        stableBorrowBalance: common.toBigUnit(currentStableDebt, asset.decimals),
        variableBorrowBalance: common.toBigUnit(currentVariableDebt, asset.decimals),
        usageAsCollateralEnabled,
      };
    }

    return userBalancesMap;
  }

  // https://github.com/aave/interface/blob/release-2023-07-25_15-22/src/hooks/app-data-provider/useAppDataProvider.tsx#L228
  // https://github.com/aave/protocol-v2/blob/master/contracts/protocol/libraries/logic/GenericLogic.sol#L150
  async getPortfolios(account: string) {
    const reserveDataMap = await this.getReserveDataMap();
    const assetPriceMap = await this.getAssetPriceMap();
    const userBalancesMap = await this.getUserBalancesMap(account);

    const supplies: SupplyObject[] = [];
    for (const token of tokensForDepositMap[this.chainId]) {
      if (token.isWrapped) continue;

      const reserveData = reserveDataMap[token.address];
      const assetPrice = assetPriceMap[token.address];
      const userBalance = userBalancesMap[token.address];

      let usageAsCollateralEnabled = reserveData.usageAsCollateralEnabled;
      if (Number(userBalance.supplyBalance) > 0) {
        usageAsCollateralEnabled = userBalance.usageAsCollateralEnabled;
      }

      supplies.push({
        token,
        price: assetPrice,
        balance: userBalance.supplyBalance,
        apy: reserveData.supplyAPY,
        usageAsCollateralEnabled,
        ltv: reserveData.ltv,
        liquidationThreshold: reserveData.liquidationThreshold,
      });
    }

    const borrows: BorrowObject[] = [];
    for (const token of tokensForBorrowMap[this.chainId]) {
      if (token.isWrapped) continue;

      const { stableBorrowAPY, variableBorrowAPY } = reserveDataMap[token.address];
      const assetPrice = assetPriceMap[token.address];
      const { stableBorrowBalance, variableBorrowBalance } = userBalancesMap[token.address];

      borrows.push({
        token,
        price: assetPrice,
        balances: [variableBorrowBalance, stableBorrowBalance],
        apys: [variableBorrowAPY, stableBorrowAPY],
      });
    }

    const portfolio = new Portfolio(this.chainId, this.id, this.market.id, supplies, borrows);

    return [portfolio];
  }

  async getPortfolio(account: string) {
    return this.getPortfolios(account).then((portfolios) => portfolios[0]);
  }

  toUnderlyingToken(_marketId: string, protocolToken: common.Token) {
    return toToken(this.chainId, protocolToken);
  }

  toProtocolToken(_marketId: string, underlyingToken: common.Token) {
    return toAToken(this.chainId, underlyingToken);
  }

  isProtocolToken(_marketId: string, token: common.Token) {
    return isAToken(this.chainId, token);
  }

  async newSupplyLogic({ marketId, input }: TokenInFields) {
    return apisdk.protocols.aavev2.newDepositLogic({
      input,
      output: new common.TokenAmount(this.toProtocolToken(marketId, input.token), input.amount),
    });
  }

  async newWithdrawLogic({ marketId, output }: TokenOutFields) {
    return apisdk.protocols.aavev2.newWithdrawLogic({
      input: new common.TokenAmount(this.toProtocolToken(marketId, output.token), output.amount),
      output,
    });
  }

  newBorrowLogic({ output }: TokenOutFields) {
    return apisdk.protocols.aavev2.newBorrowLogic({
      output,
      interestRateMode: logics.aavev2.InterestRateMode.variable,
    });
  }

  async newRepayLogic({ input, account }: RepayFields) {
    return apisdk.protocols.aavev2.newRepayLogic({
      input,
      borrower: account,
      interestRateMode: logics.aavev2.InterestRateMode.variable,
    });
  }
}
