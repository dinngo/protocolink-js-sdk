import * as common from '@protocolink/common';
import { isNativeToken, unwrapToken, wrapToken } from 'src/helper';
import * as logics from '@protocolink/logics';

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
  };
}

type ContractName = 'LendingPool' | 'ProtocolDataProvider' | 'PriceOracle' | 'ETHPriceFeed';

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
      LendingPool: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      ProtocolDataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
      PriceOracle: '0xA50ba011c48153De246E5192C8f9258A2ba79Ca9',
      ETHPriceFeed: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    },
    reserves: [
      {
        asset: logics.aavev2.mainnetTokens.AAVE,
        aToken: logics.aavev2.mainnetTokens.aAAVE,
        stableDebtTokenAddress: '0x079D6a3E844BcECf5720478A718Edb6575362C5f',
        variableDebtTokenAddress: '0xF7DBA49d571745D9d7fcb56225B05BEA803EBf3C',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      // {
      //   asset: logics.aavev2.mainnetTokens.AMPL,
      //   aToken: logics.aavev2.mainnetTokens.aAMPL,
      //   stableDebtTokenAddress: '0x18152C9f77DAdc737006e9430dB913159645fa87',
      //   variableDebtTokenAddress: '0xf013D90E4e4E3Baf420dFea60735e75dbd42f1e1',
      //   used: { withdraw: true, repay: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.BAL,
      //   aToken: logics.aavev2.mainnetTokens.aBAL,
      //   stableDebtTokenAddress: '0xe569d31590307d05DA3812964F1eDd551D665a0b',
      //   variableDebtTokenAddress: '0x13210D4Fe0d5402bd7Ecbc4B5bC5cFcA3b71adB0',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.BAT,
      //   aToken: logics.aavev2.mainnetTokens.aBAT,
      //   stableDebtTokenAddress: '0x277f8676FAcf4dAA5a6EA38ba511B7F65AA02f9F',
      //   variableDebtTokenAddress: '0xfc218A6Dfe6901CB34B1a5281FC6f1b8e7E56877',
      //   used: { withdraw: true, repay: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.BUSD,
      //   aToken: logics.aavev2.mainnetTokens.aBUSD,
      //   stableDebtTokenAddress: '0x4A7A63909A72D268b1D8a93a9395d098688e0e5C',
      //   variableDebtTokenAddress: '0xbA429f7011c9fa04cDd46a2Da24dc0FF0aC6099c',
      //   used: { withdraw: true, repay: true },
      // },
      {
        asset: logics.aavev2.mainnetTokens.CRV,
        aToken: logics.aavev2.mainnetTokens.aCRV,
        stableDebtTokenAddress: '0x9288059a74f589C919c7Cf1Db433251CdFEB874B',
        variableDebtTokenAddress: '0x00ad8eBF64F141f1C81e9f8f792d3d1631c6c684',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: logics.aavev2.mainnetTokens.DAI,
        aToken: logics.aavev2.mainnetTokens.aDAI,
        stableDebtTokenAddress: '0x778A13D3eeb110A4f7bb6529F99c000119a08E92',
        variableDebtTokenAddress: '0x6C3c78838c761c6Ac7bE9F59fe808ea2A6E4379d',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      // {
      //   asset: logics.aavev2.mainnetTokens.DPI,
      //   aToken: logics.aavev2.mainnetTokens.aDPI,
      //   stableDebtTokenAddress: '0xa3953F07f389d719F99FC378ebDb9276177d8A6e',
      //   variableDebtTokenAddress: '0x4dDff5885a67E4EffeC55875a3977D7E60F82ae0',
      //   used: { deposit: true, withdraw: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.FEI,
      //   aToken: logics.aavev2.mainnetTokens.aFEI,
      //   stableDebtTokenAddress: '0xd89cF9E8A858F8B4b31Faf793505e112d6c17449',
      //   variableDebtTokenAddress: '0xC2e10006AccAb7B45D9184FcF5b7EC7763f5BaAe',
      //   used: { withdraw: true, repay: true },
      // },

      // {
      //   asset: logics.aavev2.mainnetTokens.ENJ,
      //   aToken: logics.aavev2.mainnetTokens.aENJ,
      //   stableDebtTokenAddress: '0x943DcCA156b5312Aa24c1a08769D67FEce4ac14C',
      //   variableDebtTokenAddress: '0x38995F292a6E31b78203254fE1cdd5Ca1010A446',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.ENS,
      //   aToken: logics.aavev2.mainnetTokens.aENS,
      //   stableDebtTokenAddress: '0x34441FFD1948E49dC7a607882D0c38Efd0083815',
      //   variableDebtTokenAddress: '0x176808047cc9b7A2C9AE202c593ED42dDD7C0D13',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      {
        asset: logics.aavev2.mainnetTokens.ETH,
        aToken: logics.aavev2.mainnetTokens.aWETH,
        stableDebtTokenAddress: '0x4e977830ba4bd783C0BB7F15d3e243f73FF57121',
        variableDebtTokenAddress: '0xF63B34710400CAd3e044cFfDcAb00a0f32E33eCf',
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: logics.aavev2.mainnetTokens.FRAX,
        aToken: logics.aavev2.mainnetTokens.aFRAX,
        stableDebtTokenAddress: '0x3916e3B6c84b161df1b2733dFfc9569a1dA710c2',
        variableDebtTokenAddress: '0xfE8F19B17fFeF0fDbfe2671F248903055AFAA8Ca',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: logics.aavev2.mainnetTokens.GUSD,
        aToken: logics.aavev2.mainnetTokens.aGUSD,
        stableDebtTokenAddress: '0xf8aC64ec6Ff8E0028b37EB89772d21865321bCe0',
        variableDebtTokenAddress: '0x279AF5b99540c1A3A7E3CDd326e19659401eF99e',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      // {
      //   asset: logics.aavev2.mainnetTokens.KNCL,
      //   aToken: logics.aavev2.mainnetTokens.aKNCL,
      //   stableDebtTokenAddress: '0x9915dfb872778B2890a117DA1F35F335eb06B54f',
      //   variableDebtTokenAddress: '0x6B05D1c608015Ccb8e205A690cB86773A96F39f1',
      //   used: { withdraw: true, repay: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.LINK,
      //   aToken: logics.aavev2.mainnetTokens.aLINK,
      //   stableDebtTokenAddress: '0xFB4AEc4Cc858F2539EBd3D37f2a43eAe5b15b98a',
      //   variableDebtTokenAddress: '0x0b8f12b1788BFdE65Aa1ca52E3e9F3Ba401be16D',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      {
        asset: logics.aavev2.mainnetTokens.LUSD,
        aToken: logics.aavev2.mainnetTokens.aLUSD,
        stableDebtTokenAddress: '0x39f010127274b2dBdB770B45e1de54d974974526',
        variableDebtTokenAddress: '0x411066489AB40442d6Fc215aD7c64224120D33F2',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      // {
      //   asset: logics.aavev2.mainnetTokens.MANA,
      //   aToken: logics.aavev2.mainnetTokens.aMANA,
      //   stableDebtTokenAddress: '0xD86C74eA2224f4B8591560652b50035E4e5c0a3b',
      //   variableDebtTokenAddress: '0x0A68976301e46Ca6Ce7410DB28883E309EA0D352',
      //   used: { withdraw: true, repay: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.MKR,
      //   aToken: logics.aavev2.mainnetTokens.aMKR,
      //   stableDebtTokenAddress: '0xC01C8E4b12a89456a9fD4e4e75B72546Bf53f0B5',
      //   variableDebtTokenAddress: '0xba728eAd5e496BE00DCF66F650b6d7758eCB50f8',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.RAI,
      //   aToken: logics.aavev2.mainnetTokens.aRAI,
      //   stableDebtTokenAddress: '0x9C72B8476C33AE214ee3e8C20F0bc28496a62032',
      //   variableDebtTokenAddress: '0xB5385132EE8321977FfF44b60cDE9fE9AB0B4e6b',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.REN,
      //   aToken: logics.aavev2.mainnetTokens.aREN,
      //   stableDebtTokenAddress: '0x3356Ec1eFA75d9D150Da1EC7d944D9EDf73703B7',
      //   variableDebtTokenAddress: '0xcd9D82d33bd737De215cDac57FE2F7f04DF77FE0',
      //   used: { withdraw: true, repay: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.SNX,
      //   aToken: logics.aavev2.mainnetTokens.aSNX,
      //   stableDebtTokenAddress: '0x8575c8ae70bDB71606A53AeA1c6789cB0fBF3166',
      //   variableDebtTokenAddress: '0x267EB8Cf715455517F9BD5834AeAE3CeA1EBdbD8',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      {
        asset: logics.aavev2.mainnetTokens.TUSD,
        aToken: logics.aavev2.mainnetTokens.aTUSD,
        stableDebtTokenAddress: '0x7f38d60D94652072b2C44a18c0e14A481EC3C0dd',
        variableDebtTokenAddress: '0x01C0eb1f8c6F1C1bF74ae028697ce7AA2a8b0E92',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      // {
      //   asset: logics.aavev2.mainnetTokens.UNI,
      //   aToken: logics.aavev2.mainnetTokens.aUNI,
      //   stableDebtTokenAddress: '0xD939F7430dC8D5a427f156dE1012A56C18AcB6Aa',
      //   variableDebtTokenAddress: '0x5BdB050A92CADcCfCDcCCBFC17204a1C9cC0Ab73',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
      {
        asset: logics.aavev2.mainnetTokens.USDC,
        aToken: logics.aavev2.mainnetTokens.aUSDC,
        stableDebtTokenAddress: '0xE4922afAB0BbaDd8ab2a88E0C79d884Ad337fcA6',
        variableDebtTokenAddress: '0x619beb58998eD2278e08620f97007e1116D5D25b',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: logics.aavev2.mainnetTokens.USDT,
        aToken: logics.aavev2.mainnetTokens.aUSDT,
        stableDebtTokenAddress: '0xe91D55AB2240594855aBd11b3faAE801Fd4c4687',
        variableDebtTokenAddress: '0x531842cEbbdD378f8ee36D171d6cC9C4fcf475Ec',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: logics.aavev2.mainnetTokens.WETH,
        aToken: logics.aavev2.mainnetTokens.aWETH,
        stableDebtTokenAddress: '0x4e977830ba4bd783C0BB7F15d3e243f73FF57121',
        variableDebtTokenAddress: '0xF63B34710400CAd3e044cFfDcAb00a0f32E33eCf',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: logics.aavev2.mainnetTokens.WBTC,
        aToken: logics.aavev2.mainnetTokens.aWBTC,
        stableDebtTokenAddress: '0x51B039b9AFE64B78758f8Ef091211b5387eA717c',
        variableDebtTokenAddress: '0x9c39809Dec7F95F5e0713634a4D0701329B3b4d2',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      // {
      //   asset: logics.aavev2.mainnetTokens.YFI,
      //   aToken: logics.aavev2.mainnetTokens.aYFI,
      //   stableDebtTokenAddress: '0xca823F78C2Dd38993284bb42Ba9b14152082F7BD',
      //   variableDebtTokenAddress: '0x7EbD09022Be45AD993BAA1CEc61166Fcc8644d97',
      //   used: { withdraw: true, repay: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.ZRX,
      //   aToken: logics.aavev2.mainnetTokens.aZRX,
      //   stableDebtTokenAddress: '0x071B4323a24E73A5afeEbe34118Cd21B8FAAF7C3',
      //   variableDebtTokenAddress: '0x85791D117A392097590bDeD3bD5abB8d5A20491A',
      //   used: { withdraw: true, repay: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.renFIL,
      //   aToken: logics.aavev2.mainnetTokens.aRENFIL,
      //   stableDebtTokenAddress: '0xcAad05C49E14075077915cB5C820EB3245aFb950',
      //   variableDebtTokenAddress: '0x348e2eBD5E962854871874E444F4122399c02755',
      //   used: { withdraw: true, repay: true },
      // },
      {
        asset: logics.aavev2.mainnetTokens.sUSD,
        aToken: logics.aavev2.mainnetTokens.aSUSD,
        stableDebtTokenAddress: '0x30B0f7324feDF89d8eff397275F8983397eFe4af',
        variableDebtTokenAddress: '0xdC6a3Ab17299D9C2A412B0e0a4C1f55446AE0817',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      // {
      //   asset: logics.aavev2.mainnetTokens.stETH,
      //   aToken: logics.aavev2.mainnetTokens.astETH,
      //   stableDebtTokenAddress: '0x66457616Dd8489dF5D0AFD8678F4A260088aAF55',
      //   variableDebtTokenAddress: '0xA9DEAc9f00Dc4310c35603FCD9D34d1A750f81Db',
      //   used: { deposit: true, withdraw: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.xSUSHI,
      //   aToken: logics.aavev2.mainnetTokens.aXSUSHI,
      //   stableDebtTokenAddress: '0x73Bfb81D7dbA75C904f430eA8BAe82DB0D41187B',
      //   variableDebtTokenAddress: '0xfAFEDF95E21184E3d880bd56D4806c4b8d31c69A',
      //   used: { deposit: true, withdraw: true, repay: true },
      // },
      // {
      //   asset: logics.aavev2.mainnetTokens.PAX,
      //   aToken: logics.aavev2.mainnetTokens.aUSDP,
      //   stableDebtTokenAddress: '0x2387119bc85A74e0BBcbe190d80676CB16F10D4F',
      //   variableDebtTokenAddress: '0xFDb93B3b10936cf81FA59A02A7523B6e2149b2B7',
      //   used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      // },
    ],
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV2Polygon.sol
  // {
  //   chainId: common.ChainId.polygon,
  //   contractMap: {
  //     LendingPool: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
  //     ProtocolDataProvider: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
  //     PriceOracle: '0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d',
  //     ETHPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
  //   },
  //   reserves: [
  //     {
  //       asset: logics.aavev2.polygonTokens.AAVE,
  //       aToken: logics.aavev2.polygonTokens.amAAVE,
  //       stableDebtTokenAddress: '0x17912140e780B29Ba01381F088f21E8d75F954F9',
  //       variableDebtTokenAddress: '0x1c313e9d0d826662F5CE692134D938656F681350',
  //       used: { deposit: true, withdraw: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.BAL,
  //       aToken: logics.aavev2.polygonTokens.amBAL,
  //       stableDebtTokenAddress: '0xbC30bbe0472E0E86b6f395f9876B950A13B23923',
  //       variableDebtTokenAddress: '0x773E0e32e7b6a00b7cA9daa85dfba9D61B7f2574',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.CRV,
  //       aToken: logics.aavev2.polygonTokens.amCRV,
  //       stableDebtTokenAddress: '0x807c97744e6C9452e7C2914d78f49d171a9974a0',
  //       variableDebtTokenAddress: '0x780BbcBCda2cdb0d2c61fd9BC68c9046B18f3229',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.DAI,
  //       aToken: logics.aavev2.polygonTokens.amDAI,
  //       stableDebtTokenAddress: '0x2238101B7014C279aaF6b408A284E49cDBd5DB55',
  //       variableDebtTokenAddress: '0x75c4d1Fb84429023170086f06E682DcbBF537b7d',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.DPI,
  //       aToken: logics.aavev2.polygonTokens.amDPI,
  //       stableDebtTokenAddress: '0xA742710c0244a8Ebcf533368e3f0B956B6E53F7B',
  //       variableDebtTokenAddress: '0x43150AA0B7e19293D935A412C8607f9172d3d3f3',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.GHST,
  //       aToken: logics.aavev2.polygonTokens.amGHST,
  //       stableDebtTokenAddress: '0x6A01Db46Ae51B19A6B85be38f1AA102d8735d05b',
  //       variableDebtTokenAddress: '0x36e988a38542C3482013Bb54ee46aC1fb1efedcd',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.LINK,
  //       aToken: logics.aavev2.polygonTokens.amLINK,
  //       stableDebtTokenAddress: '0x9fb7F546E60DDFaA242CAeF146FA2f4172088117',
  //       variableDebtTokenAddress: '0xCC71e4A38c974e19bdBC6C0C19b63b8520b1Bb09',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.MATIC,
  //       aToken: logics.aavev2.polygonTokens.amWMATIC,
  //       stableDebtTokenAddress: '0xb9A6E29fB540C5F1243ef643EB39b0AcbC2e68E3',
  //       variableDebtTokenAddress: '0x59e8E9100cbfCBCBAdf86b9279fa61526bBB8765',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.SUSHI,
  //       aToken: logics.aavev2.polygonTokens.amSUSHI,
  //       stableDebtTokenAddress: '0x7Ed588DCb30Ea11A54D8a5E9645960262A97cd54',
  //       variableDebtTokenAddress: '0x9CB9fEaFA73bF392C905eEbf5669ad3d073c3DFC',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.USDC,
  //       aToken: logics.aavev2.polygonTokens.amUSDC,
  //       stableDebtTokenAddress: '0xdeb05676dB0DB85cecafE8933c903466Bf20C572',
  //       variableDebtTokenAddress: '0x248960A9d75EdFa3de94F7193eae3161Eb349a12',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.USDT,
  //       aToken: logics.aavev2.polygonTokens.amUSDT,
  //       stableDebtTokenAddress: '0xe590cfca10e81FeD9B0e4496381f02256f5d2f61',
  //       variableDebtTokenAddress: '0x8038857FD47108A07d1f6Bf652ef1cBeC279A2f3',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.WBTC,
  //       aToken: logics.aavev2.polygonTokens.amWBTC,
  //       stableDebtTokenAddress: '0x2551B15dB740dB8348bFaDFe06830210eC2c2F13',
  //       variableDebtTokenAddress: '0xF664F50631A6f0D72ecdaa0e49b0c019Fa72a8dC',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.WETH,
  //       aToken: logics.aavev2.polygonTokens.amWETH,
  //       stableDebtTokenAddress: '0xc478cBbeB590C76b01ce658f8C4dda04f30e2C6f',
  //       variableDebtTokenAddress: '0xeDe17e9d79fc6f9fF9250D9EEfbdB88Cc18038b5',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //     {
  //       asset: logics.aavev2.polygonTokens.WMATIC,
  //       aToken: logics.aavev2.polygonTokens.amWMATIC,
  //       stableDebtTokenAddress: '0xb9A6E29fB540C5F1243ef643EB39b0AcbC2e68E3',
  //       variableDebtTokenAddress: '0x59e8E9100cbfCBCBAdf86b9279fa61526bBB8765',
  //       used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
  //     },
  //   ],
  // },
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
      const { asset, aToken, stableDebtTokenAddress, variableDebtTokenAddress, used } = reserve;
      if (!isNativeToken(chainId, asset)) {
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
  return reserveMap[chainId][wrapToken(chainId, token).address].aToken;
}

export function isAToken(chainId: number, token: common.Token): boolean {
  const aToken = reserveMap[chainId][token.address].aToken;
  return aToken.is(token);
}

export function toToken(chainId: number, aToken: common.Token, unwrap = true) {
  const asset = reserveMap[chainId][aToken.address].asset;
  return unwrap ? unwrapToken(chainId, asset) : asset;
}

export function getDebtTokenAddress(chainId: number, token: common.Token, rateMode: RateMode): string {
  const reserve = reserveMap[chainId][wrapToken(chainId, token).address];
  return rateMode === RateMode.STABLE ? reserve.stableDebtTokenAddress : reserve.variableDebtTokenAddress;
}
