import * as common from '@protocolink/common';
import { gnosisTokens, mainnetTokens } from './tokens';

export const ID = 'spark';
export const DISPLAY_NAME = 'Spark';

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

type ContractName = 'Pool' | 'PoolDataProvider' | 'AaveOracle';

interface Config {
  chainId: number;
  contractMap: Record<ContractName, string>;
  reserves: Reserve[];
}

export const configs: Config[] = [
  // https://devs.spark.fi/deployment-addresses/ethereum-addresses
  {
    chainId: common.ChainId.mainnet,
    contractMap: {
      Pool: '0xC13e21B648A5Ee794902342038FF3aDAB66BE987',
      PoolDataProvider: '0xFc21d6d146E6086B8359705C8b28512a983db0cb',
      AaveOracle: '0x8105f69D9C41644c6A0803fDA7D03Aa70996cFD9',
    },
    reserves: [
      {
        asset: mainnetTokens.DAI,
        aToken: mainnetTokens.spDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.sDAI,
        aToken: mainnetTokens.spsDAI,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDC,
        aToken: mainnetTokens.spUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDT,
        aToken: mainnetTokens.spUSDT,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.ETH,
        aToken: mainnetTokens.spWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: mainnetTokens.WETH,
        aToken: mainnetTokens.spWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.wstETH,
        aToken: mainnetTokens.spwstETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.rETH,
        aToken: mainnetTokens.sprETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.WBTC,
        aToken: mainnetTokens.spWBTC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
  // https://devs.spark.fi/deployment-addresses/gnosis-addresses
  {
    chainId: common.ChainId.gnosis,
    contractMap: {
      Pool: '0x2Dae5307c5E3FD1CF5A72Cb6F698f915860607e0',
      PoolDataProvider: '0x2a002054A06546bB5a264D57A81347e23Af91D18',
      AaveOracle: '0x8105f69D9C41644c6A0803fDA7D03Aa70996cFD9',
    },
    reserves: [
      {
        asset: gnosisTokens.xDAI,
        aToken: gnosisTokens.spWXDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: gnosisTokens.WXDAI,
        aToken: gnosisTokens.spWXDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: gnosisTokens.WETH,
        aToken: gnosisTokens.spWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: gnosisTokens.wstETH,
        aToken: gnosisTokens.spwstETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: gnosisTokens.GNO,
        aToken: gnosisTokens.spGNO,
        used: { deposit: true, withdraw: true, flashLoan: true },
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
  hasNativeTokenMap,
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
    accumulator[10][chainId] = false;
    accumulator[11][chainId] = [];
    for (const reserve of reserves) {
      const { asset, aToken, used } = reserve;
      if (asset.isNative) {
        accumulator[10][chainId] = true;
      } else {
        accumulator[2][chainId][asset.address] = reserve;
        accumulator[2][chainId][aToken.address] = reserve;
      }

      if (used.deposit) {
        accumulator[3][chainId].push(asset);
        accumulator[4][chainId].push(aToken);
      }
      if (used.withdraw) {
        accumulator[5][chainId].push(asset);
        accumulator[6][chainId].push(aToken);
      }
      if (used.borrow) accumulator[7][chainId].push(asset);
      if (used.repay) accumulator[8][chainId].push(asset);
      if (used.flashLoan) accumulator[9][chainId].push(asset);
    }
    accumulator[6][chainId] = Array.from(new Set(accumulator[6][chainId])); // uniq aToken

    return accumulator;
  },
  [[], {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}] as [
    number[],
    Record<number, Config>,
    Record<number, Record<string, Reserve>>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>,
    Record<number, common.Token[]>,
    Record<number, boolean>,
    Record<number, string[]>
  ]
);

export function getContractAddress(chainId: number, name: ContractName) {
  return configMap[chainId].contractMap[name];
}

export function toAToken(chainId: number, token: common.Token) {
  return reserveMap[chainId][token.wrapped.address].aToken;
}

export function toToken(chainId: number, aToken: common.Token, unwrap = true) {
  const asset = reserveMap[chainId][aToken.address].asset;
  return unwrap ? asset.unwrapped : asset;
}

export function hasNativeToken(chainId: number) {
  return hasNativeTokenMap[chainId];
}

export function isAToken(chainId: number, token: common.Token): boolean {
  const aToken = reserveMap[chainId][token.address].aToken;
  return aToken.is(token);
}
