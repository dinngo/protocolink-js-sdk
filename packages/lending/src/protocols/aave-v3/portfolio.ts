import { BigNumber, providers, utils } from 'ethers';

import { RAY_DECIMALS, SECONDS_PER_YEAR, calculateCompoundedRate, normalize } from '@aave/math-utils';
import * as common from '@protocolink/common';

import * as logics from '@protocolink/logics';
import {
  AToken__factory,
  AaveOracle,
  AaveOracle__factory,
  PoolDataProvider,
  PoolDataProvider__factory,
  Multicall3__factory,
  RewardsController,
  RewardsController__factory,
  Multicall3,
} from './contracts';
import { configs } from './configs';
import { Portfolio } from 'src/protocol.portfolio';
import { SupplyObject, BorrowObject } from 'src/protocol.types';

const { chainId, contractMap, reserves } = configs[0];
const poolDataProviderAddress = contractMap.PoolDataProvider;
const priceOracleAddress = contractMap.AaveOracle;

const poolDataProviderIface = PoolDataProvider__factory.createInterface();
const aTokenIface = AToken__factory.createInterface();
const multicall3Address = '0xcA11bde05977b3631167028862bE2a173976CA11';

const rpcUrl = 'https://rpc.ankr.com/eth';
const provider = new providers.JsonRpcProvider(rpcUrl);

const multicall3 = Multicall3__factory.connect(multicall3Address, provider);

export interface LendingPortfolios {
  utilization: string;
  healthRate: string;
  netAPY: string;
  liquidationThreshold: string;
  totalSupplyUSD: string;
  totalBorrowUSD: string;
  supplies: SupplyObject[];
  nonZeroSupplies: SupplyObject[];
  borrows: BorrowObject[];
  nonZeroBorrows: BorrowObject[];
}

// Get Portfolios For lending dashboard dataset
export async function getLendingPortfolios(account: string): Promise<LendingPortfolios> {
  const portfolios = await getPortfolios(account);

  return {
    utilization: portfolios.formattedUtilization,
    healthRate: portfolios.formattedHealthRate,
    netAPY: portfolios.formattedNetAPY,
    liquidationThreshold: portfolios.liquidationThreshold,
    totalSupplyUSD: portfolios.formattedTotalSupplyUSD,
    totalBorrowUSD: portfolios.formattedTotalBorrowUSD,
    supplies: portfolios.supplies,
    nonZeroSupplies: portfolios.nonZeroSupplies,
    borrows: portfolios.borrows,
    nonZeroBorrows: portfolios.nonZeroBorrows,
  };
}

// Get Portfolios Class itself
export async function getPortfolios(account: string): Promise<Portfolio> {
  const reserveDataMap = await getReserveDataMap();
  const assetPriceMap = await getAssetPriceMap();
  const userBalancesMap = await getUserBalancesMap(account);

  const supplies: SupplyObject[] = [];
  for (const { asset } of reserves) {
    const reserveData = reserveDataMap[asset.address];
    const assetPrice = assetPriceMap[asset.address];
    const userBalance = userBalancesMap[asset.address];

    let usageAsCollateralEnabled = reserveData.usageAsCollateralEnabled;
    if (Number(userBalance.supplyBalance) > 0) {
      usageAsCollateralEnabled = userBalance.usageAsCollateralEnabled;
    }

    supplies.push({
      token: asset,
      price: assetPrice,
      balance: userBalance.supplyBalance,
      apy: reserveData.supplyAPY,
      usageAsCollateralEnabled,
      ltv: reserveData.ltv,
      liquidationThreshold: reserveData.liquidationThreshold,
    });
  }

  const borrows: BorrowObject[] = [];
  for (const { asset } of reserves) {
    const { stableBorrowAPY, variableBorrowAPY } = reserveDataMap[asset.address];
    const assetPrice = assetPriceMap[asset.address];
    const { stableBorrowBalance, variableBorrowBalance } = userBalancesMap[asset.address];

    borrows.push({
      token: asset,
      price: assetPrice,
      balances: [variableBorrowBalance, stableBorrowBalance],
      apys: [variableBorrowAPY, stableBorrowAPY],
    });
  }

  const portfolio = new Portfolio(chainId, 'aavev3', 'aavev3', supplies, borrows);

  return portfolio;
}

async function getReserveDataMap() {
  const calls: Multicall3.CallStruct[] = [];

  for (const { asset } of reserves) {
    calls.push({
      target: poolDataProviderAddress,
      callData: poolDataProviderIface.encodeFunctionData('getReserveConfigurationData', [asset.address]),
    });
    calls.push({
      target: poolDataProviderAddress,
      callData: poolDataProviderIface.encodeFunctionData('getReserveData', [asset.address]),
    });
    calls.push({
      target: poolDataProviderAddress,
      callData: poolDataProviderIface.encodeFunctionData('getDebtCeiling', [asset.address]),
    });
  }

  const { returnData } = await multicall3.callStatic.aggregate(calls);

  const reserveDataMap: Record<string, any> = {};
  let j = 0;

  for (const { asset } of reserves) {
    const { ltv, liquidationThreshold, usageAsCollateralEnabled } = poolDataProviderIface.decodeFunctionResult(
      'getReserveConfigurationData',
      returnData[j]
    );
    j++;
    const { liquidityRate, variableBorrowRate, stableBorrowRate, liquidityIndex } =
      poolDataProviderIface.decodeFunctionResult('getReserveData', returnData[j]);
    j++;
    const [debtCeiling] = poolDataProviderIface.decodeFunctionResult('getDebtCeiling', returnData[j]);
    j++;

    reserveDataMap[asset.address] = {
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
      liquidityIndex,
      debtCeiling,
    };
  }

  return reserveDataMap;
}

async function getAssetPriceMap() {
  const priceOracle = AaveOracle__factory.connect(priceOracleAddress, provider);

  const assetAddresses = reserves.map(({ asset }) => asset.address);
  const assetPrices = await priceOracle.getAssetsPrices(assetAddresses);

  const assetPriceMap: Record<string, string> = {};
  for (let i = 0; i < assetAddresses.length; i++) {
    assetPriceMap[reserves[i].asset.address] = common.toBigUnit(assetPrices[i], 8);
  }

  return assetPriceMap;
}

async function getUserBalancesMap(account: string) {
  const calls: Multicall3.CallStruct[] = [];

  for (const { asset, aToken } of reserves) {
    calls.push({
      target: aToken.address,
      callData: aTokenIface.encodeFunctionData('scaledBalanceOf', [account]),
    });
    calls.push({
      target: poolDataProviderAddress,
      callData: poolDataProviderIface.encodeFunctionData('getUserReserveData', [asset.address, account]),
    });
  }

  const { returnData } = await multicall3.callStatic.aggregate(calls);

  // TODO: check this, can we reuse dataMap?
  const reserveDataMap = await getReserveDataMap();
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
  for (let i = 0; i < reserves.length; i++) {
    const { asset } = reserves[i];

    const { liquidityIndex } = reserveDataMap[asset.address];
    const [scaledBalance] = aTokenIface.decodeFunctionResult('scaledBalanceOf', returnData[j]);
    const aTokenBalance = scaledBalance.mul(liquidityIndex).div(BigNumber.from(10).pow(RAY_DECIMALS));
    j++;

    const { currentStableDebt, currentVariableDebt, usageAsCollateralEnabled } =
      poolDataProviderIface.decodeFunctionResult('getUserReserveData', returnData[j]);
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
