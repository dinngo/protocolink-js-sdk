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
import { BorrowObject, Market, RepayParams, SupplyObject, SupplyParams, WithdrawParams } from 'src/protocol.type';
import { ETHPriceFeedInterface } from './contracts/ETHPriceFeed';
import { Portfolio } from 'src/protocol.portfolio';
import { PriceOracleInterface } from './contracts/PriceOracle';
import { Protocol } from 'src/protocol';
import { ProtocolDataProviderInterface } from './contracts/ProtocolDataProvider';
import { RAY_DECIMALS, SECONDS_PER_YEAR, calculateCompoundedRate, normalize } from '@aave/math-utils';
import * as common from '@protocolink/common';
import {
  configMap,
  getContractAddress,
  isAToken,
  supportedChainIds,
  toAToken,
  toToken,
  tokensForBorrowMap,
  tokensForDepositMap,
} from './configs';
import { isWrappedNativeToken, wrapToken } from 'src/helper';
import { protocols } from '@protocolink/api';

const NAME = 'aavev2';
const displayName = 'Aave V2';
// const supportedChainIds = [1];

export class LendingProtocol extends Protocol {
  static readonly markets = supportedChainIds.map((chainId) => ({
    id: common.toNetworkId(chainId),
    chainId,
  }));

  readonly id = NAME;
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
    return displayName;
  }

  private reserveDataMap?: Record<
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

  async getPortfolio(account: string, _marketId: string) {
    return (await this.getPortfolios(account))[0];
  }

  async getReserveDataMap() {
    if (!this.reserveDataMap) {
      const calls: common.Multicall3.CallStruct[] = [];
      for (const { asset } of this.reserves) {
        const wrappedToken = wrapToken(this.chainId, asset);
        calls.push({
          target: this.protocolDataProvider.address,
          callData: this.protocolDataProviderIface.encodeFunctionData('getReserveConfigurationData', [
            wrappedToken.address,
          ]),
        });
        calls.push({
          target: this.protocolDataProvider.address,
          callData: this.protocolDataProviderIface.encodeFunctionData('getReserveData', [wrappedToken.address]),
        });
      }
      const { returnData } = await this.multicall3.callStatic.aggregate(calls);

      this.reserveDataMap = {};
      let j = 0;
      for (const { asset } of this.reserves) {
        const { ltv, liquidationThreshold, usageAsCollateralEnabled } =
          this.protocolDataProviderIface.decodeFunctionResult('getReserveConfigurationData', returnData[j]);
        j++;
        const { liquidityRate, variableBorrowRate, stableBorrowRate } =
          this.protocolDataProviderIface.decodeFunctionResult('getReserveData', returnData[j]);
        j++;

        this.reserveDataMap[asset.address] = {
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

    return this.reserveDataMap;
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
          this.reserves.map(({ asset }) => wrapToken(this.chainId, asset).address),
        ]),
      },
    ];
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);

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
          wrapToken(this.chainId, asset).address,
          account,
        ]),
      });
    }
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);

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
      if (isWrappedNativeToken(this.chainId, token)) continue;

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
      if (isWrappedNativeToken(this.chainId, token)) continue;

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

  toUnderlyingToken(protocolToken: common.Token) {
    return toToken(this.chainId, protocolToken);
  }

  toProtocolToken(underlyingToken: common.Token) {
    return toAToken(this.chainId, underlyingToken);
  }

  isProtocolToken(token: common.Token) {
    return isAToken(this.chainId, token);
  }

  async newSupplyLogic(params: SupplyParams) {
    const supplyQuotation = await protocols.aavev2.getDepositQuotation(this.chainId, {
      input: params.input,
      tokenOut: toAToken(this.chainId, params.input.token),
    });
    return protocols.aavev2.newDepositLogic({ ...supplyQuotation, balanceBps: common.BPS_BASE });
  }

  async newWithdrawLogic(params: WithdrawParams) {
    const withdrawQuotation = await protocols.aavev2.getWithdrawQuotation(this.chainId, {
      input: {
        token: toAToken(this.chainId, params.output.token),
        amount: params.output.amount,
      },
      tokenOut: params.output.token,
    });
    return protocols.aavev2.newWithdrawLogic(withdrawQuotation);
  }

  newBorrowLogic = protocols.aavev2.newBorrowLogic;

  async newRepayLogic(params: RepayParams) {
    if (!params.borrower || !params.interestRateMode) throw new Error('missing requied params');
    const repayQuotation = await protocols.aavev2.getRepayQuotation(this.chainId, {
      tokenIn: params.input.token,
      borrower: params.borrower,
      interestRateMode: params.interestRateMode,
    });
    repayQuotation.input.amount = params.input.amount;
    return protocols.aavev2.newRepayLogic(repayQuotation);
  }
}
