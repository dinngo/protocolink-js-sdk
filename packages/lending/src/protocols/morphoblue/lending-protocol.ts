import { BigNumber } from 'ethers';
import BigNumberJS from 'bignumber.js';
import { BorrowObject, Market, RepayParams, SupplyObject } from 'src/protocol.type';
import { DISPLAY_NAME, ID, configMap, getContractAddress, getMarket, marketMap, supportedChainIds } from './configs';
import { IrmInterface, MarketStruct } from './contracts/Irm';
import { Irm__factory, Morpho, Morpho__factory, Oracle__factory, PriceFeed__factory } from './contracts';
import { MorphoInterface } from './contracts/Morpho';
import { OracleInterface } from './contracts/Oracle';
import { Portfolio } from 'src/protocol.portfolio';
import { PriceFeedInterface } from './contracts/PriceFeed';
import { Protocol } from 'src/protocol';
import { SECONDS_PER_YEAR } from '@aave/math-utils';
import * as apisdk from '@protocolink/api';
import * as common from '@protocolink/common';

export class LendingProtocol extends Protocol {
  readonly id = ID;

  static readonly markets = supportedChainIds.reduce((accumulator, chainId) => {
    for (const marketId of Object.keys(marketMap[chainId])) {
      accumulator.push({ id: marketId, chainId });
    }
    return accumulator;
  }, [] as Market[]);

  private _morpho?: Morpho;

  get morpho() {
    if (!this._morpho) {
      this._morpho = Morpho__factory.connect(getContractAddress(this.chainId, 'Morpho'), this.provider);
    }
    return this._morpho;
  }

  private _morphoIface?: MorphoInterface;

  get morphoIface() {
    if (!this._morphoIface) {
      this._morphoIface = Morpho__factory.createInterface();
    }
    return this._morphoIface;
  }

  private _priceFeedIface?: PriceFeedInterface;

  get priceFeedIface() {
    if (!this._priceFeedIface) {
      this._priceFeedIface = PriceFeed__factory.createInterface();
    }
    return this._priceFeedIface;
  }

  private _oracleIface?: OracleInterface;

  get oracleIface() {
    if (!this._oracleIface) {
      this._oracleIface = Oracle__factory.createInterface();
    }
    return this._oracleIface;
  }

  private _irmIface?: IrmInterface;

  get irmIface() {
    if (!this._irmIface) {
      this._irmIface = Irm__factory.createInterface();
    }
    return this._irmIface;
  }

  getMarketName(id: string) {
    const { loanToken, collateralToken } = getMarket(this.chainId, id);
    return `${DISPLAY_NAME} ${loanToken.symbol}(${collateralToken.symbol} collateral)`;
  }

  async getPortfolio(account: string, marketId: string) {
    const { loanToken, collateralToken, loanTokenPriceFeedAddress, oracle, lltv } = getMarket(this.chainId, marketId);

    const calls: common.Multicall3.CallStruct[] = [
      {
        target: this.morpho.address,
        callData: this.morphoIface.encodeFunctionData('position', [marketId, account]),
      },
      {
        target: this.morpho.address,
        callData: this.morphoIface.encodeFunctionData('market', [marketId]),
      },
      {
        target: loanTokenPriceFeedAddress,
        callData: this.priceFeedIface.encodeFunctionData('latestAnswer'),
      },
      {
        target: oracle,
        callData: this.oracleIface.encodeFunctionData('price'),
      },
    ];

    const { returnData } = await this.multicall3.callStatic.aggregate(calls, { blockTag: this.blockTag });

    const { borrowShares, collateral } = this.morphoIface.decodeFunctionResult('position', returnData[0]);

    const { totalSupplyAssets, totalSupplyShares, totalBorrowAssets, totalBorrowShares, lastUpdate, fee } =
      this.morphoIface.decodeFunctionResult('market', returnData[1]);

    const [_loanTokenPrice] = this.priceFeedIface.decodeFunctionResult('latestAnswer', returnData[2]);

    // https://docs.morpho.org/contracts/morpho-blue/reference/oracles/#price
    // It corresponds to the price of 10**(collateral token decimals) assets of
    // collateral token quoted in 10**(loan token decimals) assets of loan token
    // with `36 + loan token decimals - collateral token decimals` decimals of precision.
    const [normalizedCollateralLoanPrice] = this.oracleIface.decodeFunctionResult('price', returnData[3]);
    const normalizedCollateralLoanDecimals = 36 + loanToken.decimals - collateralToken.decimals;

    const loan = totalBorrowAssets.mul(borrowShares).div(totalBorrowShares);

    const supplyBalance = common.toBigUnit(collateral, collateralToken.decimals);
    const borrowBalance = common.toBigUnit(loan.toString(), loanToken.decimals);
    const totalSupply = common.toBigUnit(totalSupplyAssets, collateralToken.decimals);
    const totalBorrow = common.toBigUnit(totalBorrowAssets, loanToken.decimals);

    const loanTokenPrice = common.toBigUnit(_loanTokenPrice, 8);
    const collateralTokenPrice = common.toBigUnit(
      _loanTokenPrice.mul(normalizedCollateralLoanPrice).div(BigNumber.from(10).pow(normalizedCollateralLoanDecimals)),
      8
    );

    const borrowApy = await this.getBorrowAPY(marketId, {
      totalSupplyAssets,
      totalSupplyShares,
      totalBorrowAssets,
      totalBorrowShares,
      lastUpdate,
      fee,
    });

    const maxLtv = common.toBigUnit(lltv, 18);

    const supplies: SupplyObject[] = [
      {
        token: collateralToken,
        price: collateralTokenPrice,
        balance: supplyBalance,
        apy: '0',
        usageAsCollateralEnabled: true,
        ltv: maxLtv,
        liquidationThreshold: maxLtv,
        totalSupply,
      },
    ];

    const borrows: BorrowObject[] = [
      {
        token: loanToken,
        price: loanTokenPrice,
        balances: [borrowBalance],
        apys: [borrowApy],
        totalBorrow,
      },
    ];

    const portfolio = new Portfolio(this.chainId, this.id, marketId, supplies, borrows);

    return portfolio;
  }

  async getPortfolios(account: string) {
    return Promise.all(configMap[this.chainId].markets.map(({ id }) => this.getPortfolio(account, id)));
  }
  override canCollateralSwap() {
    return false;
  }

  override canDebtSwap() {
    return false;
  }

  canLeverageByDebt = false;

  override isAssetTokenized(_marketId: string, _assetToken: common.Token) {
    return false;
  }

  async getBorrowAPY(marketId: string, market: MarketStruct) {
    const { loanToken, collateralToken, oracle, irm, lltv } = getMarket(this.chainId, marketId);

    const irmContract = Irm__factory.connect(irm, this.provider);

    const borrowRateView = await irmContract.borrowRateView(
      {
        loanToken: loanToken.address,
        collateralToken: collateralToken.address,
        oracle,
        irm,
        lltv,
      },
      market,
      { blockTag: this.blockTag }
    );
    const borrowApy = (
      Math.exp(new BigNumberJS(borrowRateView.toString()).div(1e18).times(SECONDS_PER_YEAR).toNumber()) - 1
    ).toString();

    return borrowApy;
  }

  newSupplyLogic = apisdk.protocols.morphoblue.newSupplyCollateralLogic;

  newWithdrawLogic = apisdk.protocols.morphoblue.newWithdrawCollateralLogic;

  newBorrowLogic = apisdk.protocols.morphoblue.newBorrowLogic;

  newRepayLogic({ marketId, input, account }: RepayParams) {
    return apisdk.protocols.morphoblue.newRepayLogic({ marketId, input, borrower: account });
  }
}
