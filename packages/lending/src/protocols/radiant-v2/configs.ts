import { arbitrumTokens, mainnetTokens } from './tokens';
import * as common from '@protocolink/common';

export const ID = 'radiant-v2';
export const DISPLAY_NAME = 'Radiant V2';

export interface Reserve {
  asset: common.Token;
  rToken: common.Token;
  used: {
    deposit?: boolean;
    withdraw?: boolean;
    borrow?: boolean;
    repay?: boolean;
    flashLoan?: boolean;
  };
}

type ContractName = 'ProtocolDataProvider' | 'PriceOracle';

interface Config {
  chainId: number;
  contractMap: Record<ContractName, string>;
  reserves: Reserve[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contractMap: {
      ProtocolDataProvider: '0x362f3BB63Cff83bd169aE1793979E9e537993813',
      PriceOracle: '0xbD60293fBe4B285402510562A64E5fCEE9c4a8F9',
    },
    reserves: [
      {
        asset: mainnetTokens.USDT,
        rToken: mainnetTokens.rUSDT,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDC,
        rToken: mainnetTokens.rUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.WETH,
        rToken: mainnetTokens.rWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.ETH,
        rToken: mainnetTokens.rWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: mainnetTokens.WBTC,
        rToken: mainnetTokens.rWBTC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.wstETH,
        rToken: mainnetTokens.rwstETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.rETH,
        rToken: mainnetTokens.rrETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
  {
    chainId: common.ChainId.arbitrum,
    contractMap: {
      ProtocolDataProvider: '0x596B0cc4c5094507C50b579a662FE7e7b094A2cC',
      PriceOracle: '0xC0cE5De939aaD880b0bdDcf9aB5750a53EDa454b',
    },
    reserves: [
      {
        asset: arbitrumTokens.WBTC,
        rToken: arbitrumTokens.rWBTC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.USDT,
        rToken: arbitrumTokens.rUSDT,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens['USDC.e'],
        rToken: arbitrumTokens.rUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.USDC,
        rToken: arbitrumTokens.rUSDCn,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.DAI,
        rToken: arbitrumTokens.rDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.WETH,
        rToken: arbitrumTokens.rWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.ETH,
        rToken: arbitrumTokens.rWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: arbitrumTokens.wstETH,
        rToken: arbitrumTokens.rWSTETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.ARB,
        rToken: arbitrumTokens.rARB,
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
  rTokensForDepositMap,
  tokensForWithdrawMap,
  rTokensForWithdrawMap,
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
      const { asset, rToken, used } = reserve;
      if (!asset.isNative) {
        accumulator[2][chainId][asset.address] = reserve;
        accumulator[2][chainId][rToken.address] = reserve;
      }

      if (used.deposit) {
        accumulator[3][chainId].push(asset);
        accumulator[4][chainId].push(rToken);
      }
      if (used.withdraw) {
        accumulator[5][chainId].push(asset);
        accumulator[6][chainId].push(rToken);
      }
      if (used.borrow) accumulator[7][chainId].push(asset);
      if (used.repay) accumulator[8][chainId].push(asset);
      if (used.flashLoan) accumulator[9][chainId].push(asset);
    }
    accumulator[6][chainId] = Array.from(new Set(accumulator[6][chainId])); // uniq rToken

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

export function toRToken(chainId: number, token: common.Token) {
  return reserveMap[chainId][token.wrapped.address].rToken;
}

export function isRToken(chainId: number, token: common.Token): boolean {
  const rToken = reserveMap[chainId][token.address].rToken;
  return rToken.is(token);
}

export function toToken(chainId: number, rToken: common.Token, unwrap = true) {
  const asset = reserveMap[chainId][rToken.address].asset;
  return unwrap ? asset.unwrapped : asset;
}
