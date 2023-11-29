import { arbitrumTokens, mainnetTokens } from './tokens';
import * as common from '@protocolink/common';
import { isNativeToken, unwrapToken, wrapToken } from 'src/helper';

export const NAME = 'radiant-v2';
export const DISPLAY_NAME = 'Radiant V2';

export enum RateMode {
  STABLE = 1,
  VARIABLE,
}

export interface Reserve {
  asset: common.Token;
  rToken: common.Token;
  stableDebtTokenAddress?: string;
  variableDebtTokenAddress: string;
  used: {
    deposit?: boolean;
    withdraw?: boolean;
    borrow?: boolean;
    repay?: boolean;
    flashLoan?: boolean;
  };
}

type ContractName = 'LendingPool' | 'ProtocolDataProvider' | 'PriceOracle';

interface Config {
  chainId: number;
  contractMap: Record<ContractName, string>;
  reserves: Reserve[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contractMap: {
      LendingPool: '0xA950974f64aA33f27F6C5e017eEE93BF7588ED07',
      ProtocolDataProvider: '0x362f3BB63Cff83bd169aE1793979E9e537993813',
      PriceOracle: '0xbD60293fBe4B285402510562A64E5fCEE9c4a8F9',
    },
    reserves: [
      {
        asset: mainnetTokens.USDT,
        rToken: mainnetTokens.rUSDT,
        variableDebtTokenAddress: '0x2D4fc0D5421C0d37d325180477ba6e16ae3aBAA7',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDC,
        rToken: mainnetTokens.rUSDC,
        variableDebtTokenAddress: '0x490726291F6434646FEb2eC96d2Cc566b18a122F',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.WETH,
        rToken: mainnetTokens.rWETH,
        variableDebtTokenAddress: '0xDf1E9234d4F10eF9FED26A7Ae0EF43e5e03bfc31',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.ETH,
        rToken: mainnetTokens.rWETH,
        variableDebtTokenAddress: '0xDf1E9234d4F10eF9FED26A7Ae0EF43e5e03bfc31',
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: mainnetTokens.WBTC,
        rToken: mainnetTokens.rWBTC,
        variableDebtTokenAddress: '0x0184eB8A4d86ff250cB2F7F3146AeCC14ccb73A4',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.wstETH,
        rToken: mainnetTokens.rwstETH,
        variableDebtTokenAddress: '0xc8CBb48a0EED0e406bb52a5cC939358c0aB644A7',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.rETH,
        rToken: mainnetTokens.rrETH,
        variableDebtTokenAddress: '0x6a0e8b4D16d5271492bb151Eb4767f25cFc23f03',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
  {
    chainId: common.ChainId.arbitrum,
    contractMap: {
      LendingPool: '0xF4B1486DD74D07706052A33d31d7c0AAFD0659E1',
      ProtocolDataProvider: '0x596B0cc4c5094507C50b579a662FE7e7b094A2cC',
      PriceOracle: '0xC0cE5De939aaD880b0bdDcf9aB5750a53EDa454b',
    },
    reserves: [
      {
        asset: arbitrumTokens.WBTC,
        rToken: arbitrumTokens.rWBTC,
        variableDebtTokenAddress: '0x3EEaFa33625DF20837eD0Cb83Ae4D1E34788b141',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.USDT,
        rToken: arbitrumTokens.rUSDT,
        variableDebtTokenAddress: '0x7C2E0F792ea5B4a4Dbd7fA7f949CF39A5c0ba185',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.USDC, // USDC.e
        rToken: arbitrumTokens.rUSDC,
        variableDebtTokenAddress: '0x107583ADAA37Dfd1CC0bf577183Bf91351d07413',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.DAI,
        rToken: arbitrumTokens.rDAI,
        variableDebtTokenAddress: '0x04A8fAEd05C97290Ab4d793A971AdEe97cD1cBbD',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.WETH,
        rToken: arbitrumTokens.rWETH,
        variableDebtTokenAddress: '0xab04c0841f39596C9F18A981a2BD32F63AB7a817',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.ETH,
        rToken: arbitrumTokens.rWETH,
        variableDebtTokenAddress: '0xab04c0841f39596C9F18A981a2BD32F63AB7a817',
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: arbitrumTokens.wstETH,
        rToken: arbitrumTokens.rWSTETH,
        variableDebtTokenAddress: '0x97B81aA985115953Ba31D59781e2D8159A50F488',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.ARB,
        rToken: arbitrumTokens.rARB,
        variableDebtTokenAddress: '0x295b97012945bD4a1A79ec7f679e16761a437e5C',
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
      const { asset, rToken, variableDebtTokenAddress, used } = reserve;
      if (!isNativeToken(chainId, asset)) {
        accumulator[2][chainId][asset.address] = reserve;
        if (rToken) accumulator[2][chainId][rToken.address] = reserve;
        accumulator[2][chainId][variableDebtTokenAddress] = reserve;
      }

      if (used.deposit) {
        accumulator[3][chainId].push(asset);
        if (rToken) accumulator[4][chainId].push(rToken);
      }
      if (used.withdraw) {
        accumulator[5][chainId].push(asset);
        if (rToken) accumulator[6][chainId].push(rToken);
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
  return reserveMap[chainId][wrapToken(chainId, token).address].rToken;
}

export function isRToken(chainId: number, token: common.Token): boolean {
  const rToken = reserveMap[chainId][token.address].rToken;
  return rToken.is(token);
}

export function toToken(chainId: number, rToken: common.Token, unwrap = true) {
  const asset = reserveMap[chainId][rToken.address].asset;
  return unwrap ? unwrapToken(chainId, asset) : asset;
}

export function getDebtTokenAddress(chainId: number, token: common.Token): string {
  const reserve = reserveMap[chainId][wrapToken(chainId, token).address];
  return reserve.variableDebtTokenAddress;
}
