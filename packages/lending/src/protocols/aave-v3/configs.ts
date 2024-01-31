import {
  arbitrumTokens,
  avalancheTokens,
  baseTokens,
  gnosisTokens,
  mainnetTokens,
  metisTokens,
  optimismTokens,
  polygonTokens,
} from './tokens';
import * as common from '@protocolink/common';

export const ID = 'aave-v3';
export const DISPLAY_NAME = 'Aave V3';

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
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Ethereum.sol
  {
    chainId: common.ChainId.mainnet,
    contractMap: {
      Pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      PoolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
      AaveOracle: '0x54586bE62E3c3580375aE3723C145253060Ca0C2',
    },
    reserves: [
      {
        asset: mainnetTokens.AAVE,
        aToken: mainnetTokens.aEthAAVE,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.DAI,
        aToken: mainnetTokens.aEthDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.LINK,
        aToken: mainnetTokens.aEthLINK,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.LUSD,
        aToken: mainnetTokens.aEthLUSD,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDC,
        aToken: mainnetTokens.aEthUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDT,
        aToken: mainnetTokens.aEthUSDT,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.WBTC,
        aToken: mainnetTokens.aEthWBTC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.cbETH,
        aToken: mainnetTokens.aEthcbETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.rETH,
        aToken: mainnetTokens.aEthrETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.wstETH,
        aToken: mainnetTokens.aEthwstETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.WETH,
        aToken: mainnetTokens.aEthWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.ETH,
        aToken: mainnetTokens.aEthWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: mainnetTokens.BAL,
        aToken: mainnetTokens.aEthBAL,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.CRV,
        aToken: mainnetTokens.aEthCRV,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.ENS,
        aToken: mainnetTokens.aEthENS,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.LDO,
        aToken: mainnetTokens.aEthLDO,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.MKR,
        aToken: mainnetTokens.aEthMKR,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.SNX,
        aToken: mainnetTokens.aEthSNX,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.UNI,
        aToken: mainnetTokens.aEthUNI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.GHO,
        aToken: mainnetTokens.aEthGHO,
        used: { borrow: true, repay: true },
      },
      {
        asset: mainnetTokens['1INCH'],
        aToken: mainnetTokens.aEth1INCH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.FRAX,
        aToken: mainnetTokens.aEthFRAX,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.RPL,
        aToken: mainnetTokens.aEthRPL,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.STG,
        aToken: mainnetTokens.aEthSTG,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.KNC,
        aToken: mainnetTokens.aEthKNC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.FXS,
        aToken: mainnetTokens.aEthFXS,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.crvUSD,
        aToken: mainnetTokens.aEthcrvUSD,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Gnosis.sol
  {
    chainId: common.ChainId.gnosis,
    contractMap: {
      Pool: '0xb50201558B00496A145fE76f7424749556E326D8',
      PoolDataProvider: '0x501B4c19dd9C2e06E94dA7b6D5Ed4ddA013EC741',
      AaveOracle: '0xeb0a051be10228213BAEb449db63719d6742F7c4',
    },
    reserves: [
      {
        asset: gnosisTokens.WETH,
        aToken: gnosisTokens.aGnoWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: gnosisTokens.wstETH,
        aToken: gnosisTokens.aGnowstETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: gnosisTokens.GNO,
        aToken: gnosisTokens.aGnoGNO,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: gnosisTokens.USDC,
        aToken: gnosisTokens.aGnoUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: gnosisTokens.xDAI,
        aToken: gnosisTokens.aGnoWXDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: gnosisTokens.WXDAI,
        aToken: gnosisTokens.aGnoWXDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: gnosisTokens.EURe,
        aToken: gnosisTokens.aGnoEURe,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: gnosisTokens.sDAI,
        aToken: gnosisTokens.aGnosDAI,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
    ],
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Polygon.sol
  {
    chainId: common.ChainId.polygon,
    contractMap: {
      Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      PoolDataProvider: '0x9441B65EE553F70df9C77d45d3283B6BC24F222d',
      AaveOracle: '0xb023e699F5a33916Ea823A16485e259257cA8Bd1',
    },
    reserves: [
      {
        asset: polygonTokens.BAL,
        aToken: polygonTokens.aPolBAL,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.CRV,
        aToken: polygonTokens.aPolCRV,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.DAI,
        aToken: polygonTokens.aPolDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.DPI,
        aToken: polygonTokens.aPolDPI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.EURS,
        aToken: polygonTokens.aPolEURS,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.GHST,
        aToken: polygonTokens.aPolGHST,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.LINK,
        aToken: polygonTokens.aPolLINK,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.SUSHI,
        aToken: polygonTokens.aPolSUSHI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens['USDC.e'],
        aToken: polygonTokens.aPolUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.USDT,
        aToken: polygonTokens.aPolUSDT,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WBTC,
        aToken: polygonTokens.aPolWBTC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WETH,
        aToken: polygonTokens.aPolWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.agEUR,
        aToken: polygonTokens.aPolAGEUR,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.AAVE,
        aToken: polygonTokens.aPolAAVE,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: polygonTokens.MaticX,
        aToken: polygonTokens.aPolMATICX,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.stMATIC,
        aToken: polygonTokens.aPolSTMATIC,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WMATIC,
        aToken: polygonTokens.aPolWMATIC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.MATIC,
        aToken: polygonTokens.aPolWMATIC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: polygonTokens.wstETH,
        aToken: polygonTokens.aPolwstETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.USDC,
        aToken: polygonTokens.aPolUSDCn,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Base.sol
  {
    chainId: common.ChainId.base,
    contractMap: {
      Pool: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
      PoolDataProvider: '0x2d8A3C5677189723C4cB8873CfC9C8976FDF38Ac',
      AaveOracle: '0x2Cc0Fc26eD4563A5ce5e8bdcfe1A2878676Ae156',
    },
    reserves: [
      {
        asset: baseTokens.ETH,
        aToken: baseTokens.aBasWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: baseTokens.WETH,
        aToken: baseTokens.aBasWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: baseTokens.cbETH,
        aToken: baseTokens.aBascbETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: baseTokens.USDbC,
        aToken: baseTokens.aBasUSDbC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: baseTokens.wstETH,
        aToken: baseTokens.aBaswstETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: baseTokens.USDC,
        aToken: baseTokens.aBasUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Arbitrum.sol
  {
    chainId: common.ChainId.arbitrum,
    contractMap: {
      Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      PoolDataProvider: '0x6b4E260b765B3cA1514e618C0215A6B7839fF93e',
      AaveOracle: '0xb56c2F0B653B2e0b10C9b928C8580Ac5Df02C7C7',
    },
    reserves: [
      {
        asset: arbitrumTokens.DAI,
        aToken: arbitrumTokens.aArbDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.EURS,
        aToken: arbitrumTokens.aArbEURS,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.LINK,
        aToken: arbitrumTokens.aArbLINK,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.USDT,
        aToken: arbitrumTokens.aArbUSDT,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.WBTC,
        aToken: arbitrumTokens.aArbWBTC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens['USDC.e'],
        aToken: arbitrumTokens.aArbUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.AAVE,
        aToken: arbitrumTokens.aArbAAVE,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.WETH,
        aToken: arbitrumTokens.aArbWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.ETH,
        aToken: arbitrumTokens.aArbWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: arbitrumTokens.LUSD,
        aToken: arbitrumTokens.aArbLUSD,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.USDC,
        aToken: arbitrumTokens.aArbUSDCn,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.rETH,
        aToken: arbitrumTokens.aArbrETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.wstETH,
        aToken: arbitrumTokens.aArbwstETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.ARB,
        aToken: arbitrumTokens.aArbARB,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.FRAX,
        aToken: arbitrumTokens.aArbFRAX,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Optimism.sol
  {
    chainId: common.ChainId.optimism,
    contractMap: {
      Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      PoolDataProvider: '0xd9Ca4878dd38B021583c1B669905592EAe76E044',
      AaveOracle: '0xD81eb3728a631871a7eBBaD631b5f424909f0c77',
    },
    reserves: [
      {
        asset: optimismTokens.DAI,
        aToken: optimismTokens.aOptDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.LINK,
        aToken: optimismTokens.aOptLINK,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.sUSD,
        aToken: optimismTokens.aOptSUSD,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens['USDC.e'],
        aToken: optimismTokens.aOptUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.WBTC,
        aToken: optimismTokens.aOptWBTC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.USDT,
        aToken: optimismTokens.aOptUSDT,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.AAVE,
        aToken: optimismTokens.aOptAAVE,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: optimismTokens.WETH,
        aToken: optimismTokens.aOptWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.ETH,
        aToken: optimismTokens.aOptWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: optimismTokens.wstETH,
        aToken: optimismTokens.aOptwstETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.OP,
        aToken: optimismTokens.aOptOP,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: optimismTokens.rETH,
        aToken: optimismTokens.aOptrETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.LUSD,
        aToken: optimismTokens.aOptLUSD,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.USDC,
        aToken: optimismTokens.aOptUSDCn,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Avalanche.sol
  {
    chainId: common.ChainId.avalanche,
    contractMap: {
      Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      PoolDataProvider: '0x50ddd0Cd4266299527d25De9CBb55fE0EB8dAc30',
      AaveOracle: '0xEBd36016B3eD09D4693Ed4251c67Bd858c3c7C9C',
    },
    reserves: [
      {
        asset: avalancheTokens.FRAX,
        aToken: avalancheTokens.aAvaFRAX,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens.USDC,
        aToken: avalancheTokens.aAvaUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens.USDt,
        aToken: avalancheTokens.aAvaUSDT,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['BTC.b'],
        aToken: avalancheTokens['aAvaBTC.b'],
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['DAI.e'],
        aToken: avalancheTokens.aAvaDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['LINK.e'],
        aToken: avalancheTokens.aAvaLINK,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['WBTC.e'],
        aToken: avalancheTokens.aAvaWBTC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['WETH.e'],
        aToken: avalancheTokens.aAvaWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens.sAVAX,
        aToken: avalancheTokens.aAvaSAVAX,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['AAVE.e'],
        aToken: avalancheTokens.aAvaAAVE,
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: avalancheTokens.WAVAX,
        aToken: avalancheTokens.aAvaWAVAX,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens.AVAX,
        aToken: avalancheTokens.aAvaWAVAX,
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: avalancheTokens.MAI,
        aToken: avalancheTokens.aAvaMAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Metis.sol
  {
    chainId: common.ChainId.metis,
    contractMap: {
      Pool: '0x90df02551bB792286e8D4f13E0e357b4Bf1D6a57',
      PoolDataProvider: '0x99411FC17Ad1B56f49719E3850B2CDcc0f9bBFd8',
      AaveOracle: '0x38D36e85E47eA6ff0d18B0adF12E5fC8984A6f8e',
    },
    reserves: [
      {
        asset: metisTokens['m.DAI'],
        aToken: metisTokens.aMetmDAI,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: metisTokens['m.USDC'],
        aToken: metisTokens.aMetmUSDC,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: metisTokens['m.USDT'],
        aToken: metisTokens.aMetmUSDT,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: metisTokens.WETH,
        aToken: metisTokens.aMetWETH,
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: metisTokens.Metis,
        aToken: metisTokens.aMetMETIS,
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
