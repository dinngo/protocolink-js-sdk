import { arbitrumTokens, avalancheTokens, mainnetTokens, metisTokens, optimismTokens, polygonTokens } from './tokens';
import * as common from '@protocolink/common';
import { isNativeToken, unwrapToken, wrapToken } from 'src/helper';

export const NAME = 'aave-v3';
export const DISPLAY_NAME = 'Aave V3';

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
        asset: mainnetTokens.AAVE,
        aToken: mainnetTokens.aEthAAVE,
        stableDebtTokenAddress: '0x268497bF083388B1504270d0E717222d3A87D6F2',
        variableDebtTokenAddress: '0xBae535520Abd9f8C85E58929e0006A2c8B372F74',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.DAI,
        aToken: mainnetTokens.aEthDAI,
        stableDebtTokenAddress: '0x413AdaC9E2Ef8683ADf5DDAEce8f19613d60D1bb',
        variableDebtTokenAddress: '0xcF8d0c70c850859266f5C338b38F9D663181C314',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.LINK,
        aToken: mainnetTokens.aEthLINK,
        stableDebtTokenAddress: '0x63B1129ca97D2b9F97f45670787Ac12a9dF1110a',
        variableDebtTokenAddress: '0x4228F8895C7dDA20227F6a5c6751b8Ebf19a6ba8',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.LUSD,
        aToken: mainnetTokens.aEthLUSD,
        stableDebtTokenAddress: '0x37A6B708FDB1483C231961b9a7F145261E815fc3',
        variableDebtTokenAddress: '0x33652e48e4B74D18520f11BfE58Edd2ED2cEc5A2',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDC,
        aToken: mainnetTokens.aEthUSDC,
        stableDebtTokenAddress: '0xB0fe3D292f4bd50De902Ba5bDF120Ad66E9d7a39',
        variableDebtTokenAddress: '0x72E95b8931767C79bA4EeE721354d6E99a61D004',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDT,
        aToken: mainnetTokens.aEthUSDT,
        stableDebtTokenAddress: '0x822Fa72Df1F229C3900f5AD6C3Fa2C424D691622',
        variableDebtTokenAddress: '0x6df1C1E379bC5a00a7b4C6e67A203333772f45A8',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.WBTC,
        aToken: mainnetTokens.aEthWBTC,
        stableDebtTokenAddress: '0xA1773F1ccF6DB192Ad8FE826D15fe1d328B03284',
        variableDebtTokenAddress: '0x40aAbEf1aa8f0eEc637E0E7d92fbfFB2F26A8b7B',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.cbETH,
        aToken: mainnetTokens.aEthcbETH,
        stableDebtTokenAddress: '0x82bE6012cea6D147B968eBAea5ceEcF6A5b4F493',
        variableDebtTokenAddress: '0x0c91bcA95b5FE69164cE583A2ec9429A569798Ed',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.rETH,
        aToken: mainnetTokens.aEthrETH,
        stableDebtTokenAddress: '0x1d1906f909CAe494c7441604DAfDDDbD0485A925',
        variableDebtTokenAddress: '0xae8593DD575FE29A9745056aA91C4b746eee62C8',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.wstETH,
        aToken: mainnetTokens.aEthwstETH,
        stableDebtTokenAddress: '0x39739943199c0fBFe9E5f1B5B160cd73a64CB85D',
        variableDebtTokenAddress: '0xC96113eED8cAB59cD8A66813bCB0cEb29F06D2e4',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.WETH,
        aToken: mainnetTokens.aEthWETH,
        stableDebtTokenAddress: '0x102633152313C81cD80419b6EcF66d14Ad68949A',
        variableDebtTokenAddress: '0xeA51d7853EEFb32b6ee06b1C12E6dcCA88Be0fFE',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.ETH,
        aToken: mainnetTokens.aEthWETH,
        stableDebtTokenAddress: '0x102633152313C81cD80419b6EcF66d14Ad68949A',
        variableDebtTokenAddress: '0xeA51d7853EEFb32b6ee06b1C12E6dcCA88Be0fFE',
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: mainnetTokens.BAL,
        aToken: mainnetTokens.aEthBAL,
        stableDebtTokenAddress: '0xB368d45aaAa07ee2c6275Cb320D140b22dE43CDD',
        variableDebtTokenAddress: '0x3D3efceb4Ff0966D34d9545D3A2fa2dcdBf451f2',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.CRV,
        aToken: mainnetTokens.aEthCRV,
        stableDebtTokenAddress: '0x90D9CD005E553111EB8C9c31Abe9706a186b6048',
        variableDebtTokenAddress: '0x1b7D3F4b3c032a5AE656e30eeA4e8E1Ba376068F',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.ENS,
        aToken: mainnetTokens.aEthENS,
        stableDebtTokenAddress: '0x7617d02E311CdE347A0cb45BB7DF2926BBaf5347',
        variableDebtTokenAddress: '0xd180D7fdD4092f07428eFE801E17BC03576b3192',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.LDO,
        aToken: mainnetTokens.aEthLDO,
        stableDebtTokenAddress: '0xa0a5bF5781Aeb548db9d4226363B9e89287C5FD2',
        variableDebtTokenAddress: '0xc30808705C01289A3D306ca9CAB081Ba9114eC82',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.MKR,
        aToken: mainnetTokens.aEthMKR,
        stableDebtTokenAddress: '0x0496372BE7e426D28E89DEBF01f19F014d5938bE',
        variableDebtTokenAddress: '0x6Efc73E54E41b27d2134fF9f98F15550f30DF9B1',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.SNX,
        aToken: mainnetTokens.aEthSNX,
        stableDebtTokenAddress: '0x478E1ec1A2BeEd94c1407c951E4B9e22d53b2501',
        variableDebtTokenAddress: '0x8d0de040e8aAd872eC3c33A3776dE9152D3c34ca',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.UNI,
        aToken: mainnetTokens.aEthUNI,
        stableDebtTokenAddress: '0x2FEc76324A0463c46f32e74A86D1cf94C02158DC',
        variableDebtTokenAddress: '0xF64178Ebd2E2719F2B1233bCb5Ef6DB4bCc4d09a',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
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
      RewardsController: '0x929EC64c34a17401F460460D4B9390518E5B473e',
    },
    reserves: [
      {
        asset: polygonTokens.BAL,
        aToken: polygonTokens.aPolBAL,
        stableDebtTokenAddress: '0xa5e408678469d23efDB7694b1B0A85BB0669e8bd',
        variableDebtTokenAddress: '0xA8669021776Bc142DfcA87c21b4A52595bCbB40a',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.CRV,
        aToken: polygonTokens.aPolCRV,
        stableDebtTokenAddress: '0x08Cb71192985E936C7Cd166A8b268035e400c3c3',
        variableDebtTokenAddress: '0x77CA01483f379E58174739308945f044e1a764dc',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.DAI,
        aToken: polygonTokens.aPolDAI,
        stableDebtTokenAddress: '0xd94112B5B62d53C9402e7A60289c6810dEF1dC9B',
        variableDebtTokenAddress: '0x8619d80FB0141ba7F184CbF22fd724116D9f7ffC',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.DPI,
        aToken: polygonTokens.aPolDPI,
        stableDebtTokenAddress: '0xDC1fad70953Bb3918592b6fCc374fe05F5811B6a',
        variableDebtTokenAddress: '0xf611aEb5013fD2c0511c9CD55c7dc5C1140741A6',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.EURS,
        aToken: polygonTokens.aPolEURS,
        stableDebtTokenAddress: '0x8a9FdE6925a839F6B1932d16B36aC026F8d3FbdB',
        variableDebtTokenAddress: '0x5D557B07776D12967914379C71a1310e917C7555',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.GHST,
        aToken: polygonTokens.aPolGHST,
        stableDebtTokenAddress: '0x3EF10DFf4928279c004308EbADc4Db8B7620d6fc',
        variableDebtTokenAddress: '0xCE186F6Cccb0c955445bb9d10C59caE488Fea559',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.LINK,
        aToken: polygonTokens.aPolLINK,
        stableDebtTokenAddress: '0x89D976629b7055ff1ca02b927BA3e020F22A44e4',
        variableDebtTokenAddress: '0x953A573793604aF8d41F306FEb8274190dB4aE0e',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.SUSHI,
        aToken: polygonTokens.aPolSUSHI,
        stableDebtTokenAddress: '0x78246294a4c6fBf614Ed73CcC9F8b875ca8eE841',
        variableDebtTokenAddress: '0x34e2eD44EF7466D5f9E0b782B5c08b57475e7907',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.USDC,
        aToken: polygonTokens.aPolUSDC,
        stableDebtTokenAddress: '0x307ffe186F84a3bc2613D1eA417A5737D69A7007',
        variableDebtTokenAddress: '0xFCCf3cAbbe80101232d343252614b6A3eE81C989',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.USDT,
        aToken: polygonTokens.aPolUSDT,
        stableDebtTokenAddress: '0x70eFfc565DB6EEf7B927610155602d31b670e802',
        variableDebtTokenAddress: '0xfb00AC187a8Eb5AFAE4eACE434F493Eb62672df7',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WBTC,
        aToken: polygonTokens.aPolWBTC,
        stableDebtTokenAddress: '0x633b207Dd676331c413D4C013a6294B0FE47cD0e',
        variableDebtTokenAddress: '0x92b42c66840C7AD907b4BF74879FF3eF7c529473',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WETH,
        aToken: polygonTokens.aPolWETH,
        stableDebtTokenAddress: '0xD8Ad37849950903571df17049516a5CD4cbE55F6',
        variableDebtTokenAddress: '0x0c84331e39d6658Cd6e6b9ba04736cC4c4734351',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.agEUR,
        aToken: polygonTokens.aPolAGEUR,
        stableDebtTokenAddress: '0x40B4BAEcc69B882e8804f9286b12228C27F8c9BF',
        variableDebtTokenAddress: '0x3ca5FA07689F266e907439aFd1fBB59c44fe12f6',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.AAVE,
        aToken: polygonTokens.aPolAAVE,
        stableDebtTokenAddress: '0xfAeF6A702D15428E588d4C0614AEFb4348D83D48',
        variableDebtTokenAddress: '0xE80761Ea617F66F96274eA5e8c37f03960ecC679',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: polygonTokens.MaticX,
        aToken: polygonTokens.aPolMATICX,
        stableDebtTokenAddress: '0x62fC96b27a510cF4977B59FF952Dc32378Cc221d',
        variableDebtTokenAddress: '0xB5b46F918C2923fC7f26DB76e8a6A6e9C4347Cf9',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.stMATIC,
        aToken: polygonTokens.aPolSTMATIC,
        stableDebtTokenAddress: '0x1fFD28689DA7d0148ff0fCB669e9f9f0Fc13a219',
        variableDebtTokenAddress: '0x6b030Ff3FB9956B1B69f475B77aE0d3Cf2CC5aFa',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WMATIC,
        aToken: polygonTokens.aPolWMATIC,
        stableDebtTokenAddress: '0xF15F26710c827DDe8ACBA678682F3Ce24f2Fb56E',
        variableDebtTokenAddress: '0x4a1c3aD6Ed28a636ee1751C69071f6be75DEb8B8',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.MATIC,
        aToken: polygonTokens.aPolWMATIC,
        stableDebtTokenAddress: '0xF15F26710c827DDe8ACBA678682F3Ce24f2Fb56E',
        variableDebtTokenAddress: '0x4a1c3aD6Ed28a636ee1751C69071f6be75DEb8B8',
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: polygonTokens.wstETH,
        aToken: polygonTokens.aPolwstETH,
        stableDebtTokenAddress: '0x173e54325AE58B072985DbF232436961981EA000',
        variableDebtTokenAddress: '0x77fA66882a8854d883101Fb8501BD3CaD347Fc32',
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
      RewardsController: '0x929EC64c34a17401F460460D4B9390518E5B473e',
    },
    reserves: [
      {
        asset: arbitrumTokens.DAI,
        aToken: arbitrumTokens.aArbDAI,
        stableDebtTokenAddress: '0xd94112B5B62d53C9402e7A60289c6810dEF1dC9B',
        variableDebtTokenAddress: '0x8619d80FB0141ba7F184CbF22fd724116D9f7ffC',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.EURS,
        aToken: arbitrumTokens.aArbEURS,
        stableDebtTokenAddress: '0xF15F26710c827DDe8ACBA678682F3Ce24f2Fb56E',
        variableDebtTokenAddress: '0x4a1c3aD6Ed28a636ee1751C69071f6be75DEb8B8',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.LINK,
        aToken: arbitrumTokens.aArbLINK,
        stableDebtTokenAddress: '0x89D976629b7055ff1ca02b927BA3e020F22A44e4',
        variableDebtTokenAddress: '0x953A573793604aF8d41F306FEb8274190dB4aE0e',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.USDT,
        aToken: arbitrumTokens.aArbUSDT,
        stableDebtTokenAddress: '0x70eFfc565DB6EEf7B927610155602d31b670e802',
        variableDebtTokenAddress: '0xfb00AC187a8Eb5AFAE4eACE434F493Eb62672df7',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.WBTC,
        aToken: arbitrumTokens.aArbWBTC,
        stableDebtTokenAddress: '0x633b207Dd676331c413D4C013a6294B0FE47cD0e',
        variableDebtTokenAddress: '0x92b42c66840C7AD907b4BF74879FF3eF7c529473',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.USDC, // USDC.e
        aToken: arbitrumTokens.aArbUSDC,
        stableDebtTokenAddress: '0x307ffe186F84a3bc2613D1eA417A5737D69A7007',
        variableDebtTokenAddress: '0xFCCf3cAbbe80101232d343252614b6A3eE81C989',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.AAVE,
        aToken: arbitrumTokens.aArbAAVE,
        stableDebtTokenAddress: '0xfAeF6A702D15428E588d4C0614AEFb4348D83D48',
        variableDebtTokenAddress: '0xE80761Ea617F66F96274eA5e8c37f03960ecC679',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.WETH,
        aToken: arbitrumTokens.aArbWETH,
        stableDebtTokenAddress: '0xD8Ad37849950903571df17049516a5CD4cbE55F6',
        variableDebtTokenAddress: '0x0c84331e39d6658Cd6e6b9ba04736cC4c4734351',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.ETH,
        aToken: arbitrumTokens.aArbWETH,
        stableDebtTokenAddress: '0xD8Ad37849950903571df17049516a5CD4cbE55F6',
        variableDebtTokenAddress: '0x0c84331e39d6658Cd6e6b9ba04736cC4c4734351',
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: arbitrumTokens.LUSD,
        aToken: arbitrumTokens.aArbLUSD,
        stableDebtTokenAddress: '0xa5e408678469d23efDB7694b1B0A85BB0669e8bd',
        variableDebtTokenAddress: '0xA8669021776Bc142DfcA87c21b4A52595bCbB40a',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.USDC,
        aToken: arbitrumTokens.aArbUSDCn,
        stableDebtTokenAddress: '0xDC1fad70953Bb3918592b6fCc374fe05F5811B6a',
        variableDebtTokenAddress: '0xf611aEb5013fD2c0511c9CD55c7dc5C1140741A6',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.rETH,
        aToken: arbitrumTokens.aArbrETH,
        stableDebtTokenAddress: '0x3EF10DFf4928279c004308EbADc4Db8B7620d6fc',
        variableDebtTokenAddress: '0xCE186F6Cccb0c955445bb9d10C59caE488Fea559',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.wstETH,
        aToken: arbitrumTokens.aArbwstETH,
        stableDebtTokenAddress: '0x08Cb71192985E936C7Cd166A8b268035e400c3c3',
        variableDebtTokenAddress: '0x77CA01483f379E58174739308945f044e1a764dc',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.ARB,
        aToken: arbitrumTokens.aArbARB,
        stableDebtTokenAddress: '0x6B4b37618D85Db2a7b469983C888040F7F05Ea3D',
        variableDebtTokenAddress: '0x44705f578135cC5d703b4c9c122528C73Eb87145',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: arbitrumTokens.FRAX,
        aToken: arbitrumTokens.aArbFRAX,
        stableDebtTokenAddress: '0x8a9FdE6925a839F6B1932d16B36aC026F8d3FbdB',
        variableDebtTokenAddress: '0x5D557B07776D12967914379C71a1310e917C7555',
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
      RewardsController: '0x929EC64c34a17401F460460D4B9390518E5B473e',
    },
    reserves: [
      {
        asset: optimismTokens.DAI,
        aToken: optimismTokens.aOptDAI,
        stableDebtTokenAddress: '0xd94112B5B62d53C9402e7A60289c6810dEF1dC9B',
        variableDebtTokenAddress: '0x8619d80FB0141ba7F184CbF22fd724116D9f7ffC',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.LINK,
        aToken: optimismTokens.aOptLINK,
        stableDebtTokenAddress: '0x89D976629b7055ff1ca02b927BA3e020F22A44e4',
        variableDebtTokenAddress: '0x953A573793604aF8d41F306FEb8274190dB4aE0e',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.sUSD,
        aToken: optimismTokens.aOptSUSD,
        stableDebtTokenAddress: '0xF15F26710c827DDe8ACBA678682F3Ce24f2Fb56E',
        variableDebtTokenAddress: '0x4a1c3aD6Ed28a636ee1751C69071f6be75DEb8B8',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.USDC,
        aToken: optimismTokens.aOptUSDC,
        stableDebtTokenAddress: '0x307ffe186F84a3bc2613D1eA417A5737D69A7007',
        variableDebtTokenAddress: '0xFCCf3cAbbe80101232d343252614b6A3eE81C989',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.WBTC,
        aToken: optimismTokens.aOptWBTC,
        stableDebtTokenAddress: '0x633b207Dd676331c413D4C013a6294B0FE47cD0e',
        variableDebtTokenAddress: '0x92b42c66840C7AD907b4BF74879FF3eF7c529473',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.USDT,
        aToken: optimismTokens.aOptUSDT,
        stableDebtTokenAddress: '0x70eFfc565DB6EEf7B927610155602d31b670e802',
        variableDebtTokenAddress: '0xfb00AC187a8Eb5AFAE4eACE434F493Eb62672df7',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.AAVE,
        aToken: optimismTokens.aOptAAVE,
        stableDebtTokenAddress: '0xfAeF6A702D15428E588d4C0614AEFb4348D83D48',
        variableDebtTokenAddress: '0xE80761Ea617F66F96274eA5e8c37f03960ecC679',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: optimismTokens.WETH,
        aToken: optimismTokens.aOptWETH,
        stableDebtTokenAddress: '0xD8Ad37849950903571df17049516a5CD4cbE55F6',
        variableDebtTokenAddress: '0x0c84331e39d6658Cd6e6b9ba04736cC4c4734351',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.ETH,
        aToken: optimismTokens.aOptWETH,
        stableDebtTokenAddress: '0xD8Ad37849950903571df17049516a5CD4cbE55F6',
        variableDebtTokenAddress: '0x0c84331e39d6658Cd6e6b9ba04736cC4c4734351',
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: optimismTokens.wstETH,
        aToken: optimismTokens.aOptwstETH,
        stableDebtTokenAddress: '0x78246294a4c6fBf614Ed73CcC9F8b875ca8eE841',
        variableDebtTokenAddress: '0x34e2eD44EF7466D5f9E0b782B5c08b57475e7907',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.OP,
        aToken: optimismTokens.aOptOP,
        stableDebtTokenAddress: '0x08Cb71192985E936C7Cd166A8b268035e400c3c3',
        variableDebtTokenAddress: '0x77CA01483f379E58174739308945f044e1a764dc',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: optimismTokens.rETH,
        aToken: optimismTokens.aOptrETH,
        stableDebtTokenAddress: '0xDC1fad70953Bb3918592b6fCc374fe05F5811B6a',
        variableDebtTokenAddress: '0xf611aEb5013fD2c0511c9CD55c7dc5C1140741A6',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: optimismTokens.LUSD,
        aToken: optimismTokens.aOptLUSD,
        stableDebtTokenAddress: '0x3EF10DFf4928279c004308EbADc4Db8B7620d6fc',
        variableDebtTokenAddress: '0xCE186F6Cccb0c955445bb9d10C59caE488Fea559',
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
      RewardsController: '0x929EC64c34a17401F460460D4B9390518E5B473e',
    },
    reserves: [
      {
        asset: avalancheTokens.FRAX,
        aToken: avalancheTokens.aAvaFRAX,
        stableDebtTokenAddress: '0x78246294a4c6fBf614Ed73CcC9F8b875ca8eE841',
        variableDebtTokenAddress: '0x34e2eD44EF7466D5f9E0b782B5c08b57475e7907',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens.USDC,
        aToken: avalancheTokens.aAvaUSDC,
        stableDebtTokenAddress: '0x307ffe186F84a3bc2613D1eA417A5737D69A7007',
        variableDebtTokenAddress: '0xFCCf3cAbbe80101232d343252614b6A3eE81C989',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens.USDt,
        aToken: avalancheTokens.aAvaUSDT,
        stableDebtTokenAddress: '0x70eFfc565DB6EEf7B927610155602d31b670e802',
        variableDebtTokenAddress: '0xfb00AC187a8Eb5AFAE4eACE434F493Eb62672df7',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['BTC.b'],
        aToken: avalancheTokens['aAvaBTC.b'],
        stableDebtTokenAddress: '0xa5e408678469d23efDB7694b1B0A85BB0669e8bd',
        variableDebtTokenAddress: '0xA8669021776Bc142DfcA87c21b4A52595bCbB40a',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['DAI.e'],
        aToken: avalancheTokens.aAvaDAI,
        stableDebtTokenAddress: '0xd94112B5B62d53C9402e7A60289c6810dEF1dC9B',
        variableDebtTokenAddress: '0x8619d80FB0141ba7F184CbF22fd724116D9f7ffC',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['LINK.e'],
        aToken: avalancheTokens.aAvaLINK,
        stableDebtTokenAddress: '0x89D976629b7055ff1ca02b927BA3e020F22A44e4',
        variableDebtTokenAddress: '0x953A573793604aF8d41F306FEb8274190dB4aE0e',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['WBTC.e'],
        aToken: avalancheTokens.aAvaWBTC,
        stableDebtTokenAddress: '0x633b207Dd676331c413D4C013a6294B0FE47cD0e',
        variableDebtTokenAddress: '0x92b42c66840C7AD907b4BF74879FF3eF7c529473',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['WETH.e'],
        aToken: avalancheTokens.aAvaWETH,
        stableDebtTokenAddress: '0xD8Ad37849950903571df17049516a5CD4cbE55F6',
        variableDebtTokenAddress: '0x0c84331e39d6658Cd6e6b9ba04736cC4c4734351',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens.sAVAX,
        aToken: avalancheTokens.aAvaSAVAX,
        stableDebtTokenAddress: '0x08Cb71192985E936C7Cd166A8b268035e400c3c3',
        variableDebtTokenAddress: '0x77CA01483f379E58174739308945f044e1a764dc',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: avalancheTokens['AAVE.e'],
        aToken: avalancheTokens.aAvaAAVE,
        stableDebtTokenAddress: '0xfAeF6A702D15428E588d4C0614AEFb4348D83D48',
        variableDebtTokenAddress: '0xE80761Ea617F66F96274eA5e8c37f03960ecC679',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: avalancheTokens.WAVAX,
        aToken: avalancheTokens.aAvaWAVAX,
        stableDebtTokenAddress: '0xF15F26710c827DDe8ACBA678682F3Ce24f2Fb56E',
        variableDebtTokenAddress: '0x4a1c3aD6Ed28a636ee1751C69071f6be75DEb8B8',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: avalancheTokens.AVAX,
        aToken: avalancheTokens.aAvaWAVAX,
        stableDebtTokenAddress: '0xF15F26710c827DDe8ACBA678682F3Ce24f2Fb56E',
        variableDebtTokenAddress: '0x4a1c3aD6Ed28a636ee1751C69071f6be75DEb8B8',
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
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
      RewardsController: '0x30C1b8F0490fa0908863d6Cbd2E36400b4310A6B',
    },
    reserves: [
      {
        asset: metisTokens['m.DAI'],
        aToken: metisTokens.aMetmDAI,
        stableDebtTokenAddress: '0xf1cd706E177F3AEa620c722Dc436B5a2066E4C68',
        variableDebtTokenAddress: '0x13Bd89aF338f3c7eAE9a75852fC2F1ca28B4DDbF',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true, borrowReward: true },
      },
      {
        asset: metisTokens['m.USDC'],
        aToken: metisTokens.aMetmUSDC,
        stableDebtTokenAddress: '0x81aC531A7CA8Bdaeb571d8d948e29481A35495C8',
        variableDebtTokenAddress: '0x571171a7EF1e3c8c83d47EF1a50E225E9c351380',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true, borrowReward: true },
      },
      {
        asset: metisTokens['m.USDT'],
        aToken: metisTokens.aMetmUSDT,
        stableDebtTokenAddress: '0xb4984c08984776074fB9BB78fFE24e9F1E97CD3F',
        variableDebtTokenAddress: '0x6B45DcE8aF4fE5Ab3bFCF030d8fB57718eAB54e5',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true, borrowReward: true },
      },
      {
        asset: metisTokens.WETH,
        aToken: metisTokens.aMetWETH,
        stableDebtTokenAddress: '0x38cFF1C1dFE9e2566F11CB717Ac43fa56fEeCFbd',
        variableDebtTokenAddress: '0x8Bb19e3DD277a73D4A95EE434F14cE4B92898421',
        used: {
          deposit: true,
          withdraw: true,
          borrow: true,
          repay: true,
          flashLoan: true,
          supplyReward: true,
          borrowReward: true,
        },
      },
      {
        asset: metisTokens.Metis,
        aToken: metisTokens.aMetMETIS,
        stableDebtTokenAddress: '0xeF547E238d689BAa811E597105A596bBE2Fe0761',
        variableDebtTokenAddress: '0x0110174183e13D5Ea59D7512226c5D5A47bA2c40',
        used: {
          deposit: true,
          withdraw: true,
          borrow: true,
          repay: true,
          flashLoan: true,
          supplyReward: true,
          borrowReward: true,
        },
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

export function isAToken(chainId: number, token: common.Token): boolean {
  const aToken = reserveMap[chainId][token.address].aToken;
  return aToken.is(token);
}
