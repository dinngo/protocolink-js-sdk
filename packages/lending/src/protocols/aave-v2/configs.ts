import * as common from '@protocolink/common';
import { mainnetTokens, polygonTokens } from './tokens';

export const ID = 'aave-v2';
export const DISPLAY_NAME = 'Aave V2';

export interface Reserve {
  asset: common.Token;
  aToken: common.Token;
  used: {
    deposit?: boolean;
    withdraw?: boolean;
    borrow?: boolean;
    repay?: boolean;
    flashLoan?: boolean;
  };
}

type ContractName = 'ProtocolDataProvider' | 'PriceOracle' | 'ETHPriceFeed';

interface Config {
  chainId: number;
  contractMap: Record<ContractName, string>;
  reserves: Reserve[];
}

export const configs: Config[] = [
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV2Ethereum.sol
  {
    chainId: common.ChainId.mainnet,
    contractMap: {
      ProtocolDataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
      PriceOracle: '0xA50ba011c48153De246E5192C8f9258A2ba79Ca9',
      ETHPriceFeed: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    },
    reserves: [
      {
        asset: mainnetTokens.AAVE,
        aToken: mainnetTokens.aAAVE,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.DAI,
        aToken: mainnetTokens.aDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.ETH,
        aToken: mainnetTokens.aWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: mainnetTokens.FRAX,
        aToken: mainnetTokens.aFRAX,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.GUSD,
        aToken: mainnetTokens.aGUSD,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.LUSD,
        aToken: mainnetTokens.aLUSD,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDC,
        aToken: mainnetTokens.aUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDT,
        aToken: mainnetTokens.aUSDT,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.WETH,
        aToken: mainnetTokens.aWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.WBTC,
        aToken: mainnetTokens.aWBTC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.sUSD,
        aToken: mainnetTokens.aSUSD,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.stETH,
        aToken: mainnetTokens.aSTETH,
        used: { deposit: true, withdraw: true },
      },
      {
        asset: mainnetTokens.USDP,
        aToken: mainnetTokens.aUSDP,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV2Polygon.sol
  {
    chainId: common.ChainId.polygon,
    contractMap: {
      ProtocolDataProvider: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
      PriceOracle: '0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d',
      ETHPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    },
    reserves: [
      {
        asset: polygonTokens.AAVE,
        aToken: polygonTokens.amAAVE,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },

      {
        asset: polygonTokens.DAI,
        aToken: polygonTokens.amDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.MATIC,
        aToken: polygonTokens.amWMATIC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: polygonTokens['USDC.e'],
        aToken: polygonTokens.amUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.USDT,
        aToken: polygonTokens.amUSDT,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WBTC,
        aToken: polygonTokens.amWBTC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WETH,
        aToken: polygonTokens.amWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WMATIC,
        aToken: polygonTokens.amWMATIC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
];

export const [
  supportedChainIds,
  configMap,
  reserveMap,
  tokensForDepositMap,
  aTokensForDepositMap,
  tokensForWithdrawMap,
  aTokensForWithdrawMap,
  tokensForBorrowMap,
  tokensForRepayMap,
  tokensForFlashLoanMap,
] = configs.reduce(
  (accumulator, config) => {
    const { chainId, reserves } = config;

    accumulator[0].push(chainId);
    accumulator[1][chainId] = config;
    accumulator[2][chainId] = {};
    accumulator[3][chainId] = [];
    accumulator[4][chainId] = [];
    accumulator[5][chainId] = [];
    accumulator[6][chainId] = [];
    accumulator[7][chainId] = [];
    accumulator[8][chainId] = [];
    accumulator[9][chainId] = [];
    for (const reserve of reserves) {
      const { asset, aToken, used } = reserve;
      if (!asset.isNative) {
        accumulator[2][chainId][asset.address] = reserve;
        if (aToken) accumulator[2][chainId][aToken.address] = reserve;
      }

      if (used.deposit) {
        accumulator[3][chainId].push(asset);
        if (aToken) accumulator[4][chainId].push(aToken);
      }
      if (used.withdraw) {
        accumulator[5][chainId].push(asset);
        if (aToken) accumulator[6][chainId].push(aToken);
      }
      if (used.borrow) accumulator[7][chainId].push(asset);
      if (used.repay) accumulator[8][chainId].push(asset);
      if (used.flashLoan) accumulator[9][chainId].push(asset);
    }
    accumulator[6][chainId] = Array.from(new Set(accumulator[6][chainId])); // uniq aToken

    return accumulator;
  },
  [[], {}, {}, {}, {}, {}, {}, {}, {}, {}] as [
    number[],
    Record<number, Config>,
    Record<number, Record<string, Reserve>>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>
  ]
);

export function getContractAddress(chainId: number, name: ContractName) {
  return configMap[chainId].contractMap[name];
}

export function toAToken(chainId: number, token: common.Token) {
  return reserveMap[chainId][token.wrapped.address].aToken;
}

export function isAToken(chainId: number, token: common.Token): boolean {
  const aToken = reserveMap[chainId][token.address].aToken;
  return aToken.is(token);
}

export function toToken(chainId: number, aToken: common.Token, unwrap = true) {
  const asset = reserveMap[chainId][aToken.address].asset;
  return unwrap ? asset.unwrapped : asset;
}
