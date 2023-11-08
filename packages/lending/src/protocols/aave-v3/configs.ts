import * as common from '@protocolink/common';
import { isNativeToken, unwrapToken, wrapToken } from 'src/helper';
import * as logics from '@protocolink/logics';

export const NAME = 'aavev3';
export const FLASHLOAN_TOTAL_PREMIUM = 5;

export enum RateMode {
  STABLE = 1,
  VARIABLE,
}

export interface Reserve {
  asset: common.Token;
  aToken: common.Token;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  used: {
    deposit?: boolean;
    withdraw?: boolean;
    borrow?: boolean;
    repay?: boolean;
    flashLoan?: boolean;
    supplyReward?: boolean;
    borrowReward?: boolean;
  };
}

type ContractName = 'Pool' | 'PoolDataProvider' | 'AaveOracle' | 'RewardsController';

interface Config {
  chainId: number;
  contractMap: Record<ContractName, string>;
  reserves: Reserve[];
}

export const configs: Config[] = [
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Ethereum.sol
  {
    chainId: common.ChainId.mainnet,
    contractMap: {
      Pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      PoolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
      AaveOracle: '0x54586bE62E3c3580375aE3723C145253060Ca0C2',
      RewardsController: '0x8164Cc65827dcFe994AB23944CBC90e0aa80bFcb',
    },
    reserves: [
      {
        asset: logics.aavev3.mainnetTokens.AAVE,
        aToken: logics.aavev3.mainnetTokens.aEthAAVE,
        stableDebtTokenAddress: '0x268497bF083388B1504270d0E717222d3A87D6F2',
        variableDebtTokenAddress: '0xBae535520Abd9f8C85E58929e0006A2c8B372F74',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: logics.aavev3.mainnetTokens.DAI,
        aToken: logics.aavev3.mainnetTokens.aEthDAI,
        stableDebtTokenAddress: '0x413AdaC9E2Ef8683ADf5DDAEce8f19613d60D1bb',
        variableDebtTokenAddress: '0xcF8d0c70c850859266f5C338b38F9D663181C314',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: logics.aavev3.mainnetTokens.LINK,
        aToken: logics.aavev3.mainnetTokens.aEthLINK,
        stableDebtTokenAddress: '0x63B1129ca97D2b9F97f45670787Ac12a9dF1110a',
        variableDebtTokenAddress: '0x4228F8895C7dDA20227F6a5c6751b8Ebf19a6ba8',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: logics.aavev3.mainnetTokens.LUSD,
        aToken: logics.aavev3.mainnetTokens.aEthLUSD,
        stableDebtTokenAddress: '0x37A6B708FDB1483C231961b9a7F145261E815fc3',
        variableDebtTokenAddress: '0x33652e48e4B74D18520f11BfE58Edd2ED2cEc5A2',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: logics.aavev3.mainnetTokens.USDC,
        aToken: logics.aavev3.mainnetTokens.aEthUSDC,
        stableDebtTokenAddress: '0xB0fe3D292f4bd50De902Ba5bDF120Ad66E9d7a39',
        variableDebtTokenAddress: '0x72E95b8931767C79bA4EeE721354d6E99a61D004',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: logics.aavev3.mainnetTokens.USDT,
        aToken: logics.aavev3.mainnetTokens.aEthUSDT,
        stableDebtTokenAddress: '0x822Fa72Df1F229C3900f5AD6C3Fa2C424D691622',
        variableDebtTokenAddress: '0x6df1C1E379bC5a00a7b4C6e67A203333772f45A8',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: logics.aavev3.mainnetTokens.WBTC,
        aToken: logics.aavev3.mainnetTokens.aEthWBTC,
        stableDebtTokenAddress: '0xA1773F1ccF6DB192Ad8FE826D15fe1d328B03284',
        variableDebtTokenAddress: '0x40aAbEf1aa8f0eEc637E0E7d92fbfFB2F26A8b7B',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: logics.aavev3.mainnetTokens.cbETH,
        aToken: logics.aavev3.mainnetTokens.aEthcbETH,
        stableDebtTokenAddress: '0x82bE6012cea6D147B968eBAea5ceEcF6A5b4F493',
        variableDebtTokenAddress: '0x0c91bcA95b5FE69164cE583A2ec9429A569798Ed',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      // {
      //   asset: logics.aavev3.mainnetTokens.rETH,
      //   aToken: logics.aavev3.mainnetTokens.aEthrETH,
      //   stableDebtTokenAddress: '0x1d1906f909CAe494c7441604DAfDDDbD0485A925',
      //   variableDebtTokenAddress: '0xae8593DD575FE29A9745056aA91C4b746eee62C8',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev3.mainnetTokens.wstETH,
      //   aToken: logics.aavev3.mainnetTokens.aEthwstETH,
      //   stableDebtTokenAddress: '0x39739943199c0fBFe9E5f1B5B160cd73a64CB85D',
      //   variableDebtTokenAddress: '0xC96113eED8cAB59cD8A66813bCB0cEb29F06D2e4',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev3.mainnetTokens.WETH,
      //   aToken: logics.aavev3.mainnetTokens.aEthWETH,
      //   stableDebtTokenAddress: '0x102633152313C81cD80419b6EcF66d14Ad68949A',
      //   variableDebtTokenAddress: '0xeA51d7853EEFb32b6ee06b1C12E6dcCA88Be0fFE',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev3.mainnetTokens.ETH,
      //   aToken: logics.aavev3.mainnetTokens.aEthWETH,
      //   stableDebtTokenAddress: '0x102633152313C81cD80419b6EcF66d14Ad68949A',
      //   variableDebtTokenAddress: '0xeA51d7853EEFb32b6ee06b1C12E6dcCA88Be0fFE',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true },
      // },
      // {
      //   asset: logics.aavev3.mainnetTokens.BAL,
      //   aToken: logics.aavev3.mainnetTokens.aEthBAL,
      //   stableDebtTokenAddress: '0xB368d45aaAa07ee2c6275Cb320D140b22dE43CDD',
      //   variableDebtTokenAddress: '0x3D3efceb4Ff0966D34d9545D3A2fa2dcdBf451f2',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev3.mainnetTokens.CRV,
      //   aToken: logics.aavev3.mainnetTokens.aEthCRV,
      //   stableDebtTokenAddress: '0x90D9CD005E553111EB8C9c31Abe9706a186b6048',
      //   variableDebtTokenAddress: '0x1b7D3F4b3c032a5AE656e30eeA4e8E1Ba376068F',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev3.mainnetTokens.ENS,
      //   aToken: logics.aavev3.mainnetTokens.aEthENS,
      //   stableDebtTokenAddress: '0x7617d02E311CdE347A0cb45BB7DF2926BBaf5347',
      //   variableDebtTokenAddress: '0xd180D7fdD4092f07428eFE801E17BC03576b3192',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev3.mainnetTokens.LDO,
      //   aToken: logics.aavev3.mainnetTokens.aEthLDO,
      //   stableDebtTokenAddress: '0xa0a5bF5781Aeb548db9d4226363B9e89287C5FD2',
      //   variableDebtTokenAddress: '0xc30808705C01289A3D306ca9CAB081Ba9114eC82',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev3.mainnetTokens.MKR,
      //   aToken: logics.aavev3.mainnetTokens.aEthMKR,
      //   stableDebtTokenAddress: '0x0496372BE7e426D28E89DEBF01f19F014d5938bE',
      //   variableDebtTokenAddress: '0x6Efc73E54E41b27d2134fF9f98F15550f30DF9B1',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev3.mainnetTokens.SNX,
      //   aToken: logics.aavev3.mainnetTokens.aEthSNX,
      //   stableDebtTokenAddress: '0x478E1ec1A2BeEd94c1407c951E4B9e22d53b2501',
      //   variableDebtTokenAddress: '0x8d0de040e8aAd872eC3c33A3776dE9152D3c34ca',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev3.mainnetTokens.UNI,
      //   aToken: logics.aavev3.mainnetTokens.aEthUNI,
      //   stableDebtTokenAddress: '0x2FEc76324A0463c46f32e74A86D1cf94C02158DC',
      //   variableDebtTokenAddress: '0xF64178Ebd2E2719F2B1233bCb5Ef6DB4bCc4d09a',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
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
  rewardTokenAddressesMap,
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
      const { asset, aToken, stableDebtTokenAddress, variableDebtTokenAddress, used } = reserve;
      if (isNativeToken(chainId, asset)) {
        accumulator[10][chainId] = true;
      } else {
        accumulator[2][chainId][asset.address] = reserve;
        if (aToken) accumulator[2][chainId][aToken.address] = reserve;
        accumulator[2][chainId][stableDebtTokenAddress] = reserve;
        accumulator[2][chainId][variableDebtTokenAddress] = reserve;
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
      if (used.supplyReward) accumulator[11][chainId].push(aToken.address);
      if (used.borrowReward) accumulator[11][chainId].push(variableDebtTokenAddress);
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
  return reserveMap[chainId][wrapToken(chainId, token).address].aToken;
}

export function toToken(chainId: number, aToken: common.Token, unwrap = true) {
  const asset = reserveMap[chainId][aToken.address].asset;
  return unwrap ? unwrapToken(chainId, asset) : asset;
}

export function getDebtTokenAddress(chainId: number, token: common.Token, rateMode: RateMode): string {
  const reserve = reserveMap[chainId][wrapToken(chainId, token).address];
  return rateMode === RateMode.STABLE ? reserve.stableDebtTokenAddress : reserve.variableDebtTokenAddress;
}

export function hasNativeToken(chainId: number) {
  return hasNativeTokenMap[chainId];
}
