import * as common from '@protocolink/common';
import { isNativeToken, unwrapToken, wrapToken } from 'src/helper';
import { mainnetTokens, polygonTokens } from './tokens';

export const NAME = 'aavev2';
export const displayName = 'Aave V2';

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
        asset: mainnetTokens.AAVE,
        aToken: mainnetTokens.aAAVE,
        stableDebtTokenAddress: '0x079D6a3E844BcECf5720478A718Edb6575362C5f',
        variableDebtTokenAddress: '0xF7DBA49d571745D9d7fcb56225B05BEA803EBf3C',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.DAI,
        aToken: mainnetTokens.aDAI,
        stableDebtTokenAddress: '0x778A13D3eeb110A4f7bb6529F99c000119a08E92',
        variableDebtTokenAddress: '0x6C3c78838c761c6Ac7bE9F59fe808ea2A6E4379d',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.ETH,
        aToken: mainnetTokens.aWETH,
        stableDebtTokenAddress: '0x4e977830ba4bd783C0BB7F15d3e243f73FF57121',
        variableDebtTokenAddress: '0xF63B34710400CAd3e044cFfDcAb00a0f32E33eCf',
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: mainnetTokens.FRAX,
        aToken: mainnetTokens.aFRAX,
        stableDebtTokenAddress: '0x3916e3B6c84b161df1b2733dFfc9569a1dA710c2',
        variableDebtTokenAddress: '0xfE8F19B17fFeF0fDbfe2671F248903055AFAA8Ca',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.GUSD,
        aToken: mainnetTokens.aGUSD,
        stableDebtTokenAddress: '0xf8aC64ec6Ff8E0028b37EB89772d21865321bCe0',
        variableDebtTokenAddress: '0x279AF5b99540c1A3A7E3CDd326e19659401eF99e',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.LUSD,
        aToken: mainnetTokens.aLUSD,
        stableDebtTokenAddress: '0x39f010127274b2dBdB770B45e1de54d974974526',
        variableDebtTokenAddress: '0x411066489AB40442d6Fc215aD7c64224120D33F2',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDC,
        aToken: mainnetTokens.aUSDC,
        stableDebtTokenAddress: '0xE4922afAB0BbaDd8ab2a88E0C79d884Ad337fcA6',
        variableDebtTokenAddress: '0x619beb58998eD2278e08620f97007e1116D5D25b',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.USDT,
        aToken: mainnetTokens.aUSDT,
        stableDebtTokenAddress: '0xe91D55AB2240594855aBd11b3faAE801Fd4c4687',
        variableDebtTokenAddress: '0x531842cEbbdD378f8ee36D171d6cC9C4fcf475Ec',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.WETH,
        aToken: mainnetTokens.aWETH,
        stableDebtTokenAddress: '0x4e977830ba4bd783C0BB7F15d3e243f73FF57121',
        variableDebtTokenAddress: '0xF63B34710400CAd3e044cFfDcAb00a0f32E33eCf',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.WBTC,
        aToken: mainnetTokens.aWBTC,
        stableDebtTokenAddress: '0x51B039b9AFE64B78758f8Ef091211b5387eA717c',
        variableDebtTokenAddress: '0x9c39809Dec7F95F5e0713634a4D0701329B3b4d2',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.sUSD,
        aToken: mainnetTokens.aSUSD,
        stableDebtTokenAddress: '0x30B0f7324feDF89d8eff397275F8983397eFe4af',
        variableDebtTokenAddress: '0xdC6a3Ab17299D9C2A412B0e0a4C1f55446AE0817',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: mainnetTokens.stETH,
        aToken: mainnetTokens.aSTETH,
        stableDebtTokenAddress: '0x66457616Dd8489dF5D0AFD8678F4A260088aAF55',
        variableDebtTokenAddress: '0xA9DEAc9f00Dc4310c35603FCD9D34d1A750f81Db',
        used: { deposit: true, withdraw: true },
      },
      {
        asset: mainnetTokens.USDP,
        aToken: mainnetTokens.aUSDP,
        stableDebtTokenAddress: '0x2387119bc85A74e0BBcbe190d80676CB16F10D4F',
        variableDebtTokenAddress: '0xFDb93B3b10936cf81FA59A02A7523B6e2149b2B7',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
    ],
  },
  // https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV2Polygon.sol
  {
    chainId: common.ChainId.polygon,
    contractMap: {
      LendingPool: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
      ProtocolDataProvider: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
      PriceOracle: '0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d',
      ETHPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    },
    reserves: [
      {
        asset: polygonTokens.AAVE,
        aToken: polygonTokens.amAAVE,
        stableDebtTokenAddress: '0x17912140e780B29Ba01381F088f21E8d75F954F9',
        variableDebtTokenAddress: '0x1c313e9d0d826662F5CE692134D938656F681350',
        used: { deposit: true, withdraw: true, flashLoan: true },
      },

      {
        asset: polygonTokens.DAI,
        aToken: polygonTokens.amDAI,
        stableDebtTokenAddress: '0x2238101B7014C279aaF6b408A284E49cDBd5DB55',
        variableDebtTokenAddress: '0x75c4d1Fb84429023170086f06E682DcbBF537b7d',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.MATIC,
        aToken: polygonTokens.amWMATIC,
        stableDebtTokenAddress: '0xb9A6E29fB540C5F1243ef643EB39b0AcbC2e68E3',
        variableDebtTokenAddress: '0x59e8E9100cbfCBCBAdf86b9279fa61526bBB8765',
        used: { deposit: true, withdraw: true, borrow: true, repay: true },
      },
      {
        asset: polygonTokens.USDC,
        aToken: polygonTokens.amUSDC,
        stableDebtTokenAddress: '0xdeb05676dB0DB85cecafE8933c903466Bf20C572',
        variableDebtTokenAddress: '0x248960A9d75EdFa3de94F7193eae3161Eb349a12',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.USDT,
        aToken: polygonTokens.amUSDT,
        stableDebtTokenAddress: '0xe590cfca10e81FeD9B0e4496381f02256f5d2f61',
        variableDebtTokenAddress: '0x8038857FD47108A07d1f6Bf652ef1cBeC279A2f3',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WBTC,
        aToken: polygonTokens.amWBTC,
        stableDebtTokenAddress: '0x2551B15dB740dB8348bFaDFe06830210eC2c2F13',
        variableDebtTokenAddress: '0xF664F50631A6f0D72ecdaa0e49b0c019Fa72a8dC',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WETH,
        aToken: polygonTokens.amWETH,
        stableDebtTokenAddress: '0xc478cBbeB590C76b01ce658f8C4dda04f30e2C6f',
        variableDebtTokenAddress: '0xeDe17e9d79fc6f9fF9250D9EEfbdB88Cc18038b5',
        used: { deposit: true, withdraw: true, borrow: true, repay: true, flashLoan: true },
      },
      {
        asset: polygonTokens.WMATIC,
        aToken: polygonTokens.amWMATIC,
        stableDebtTokenAddress: '0xb9A6E29fB540C5F1243ef643EB39b0AcbC2e68E3',
        variableDebtTokenAddress: '0x59e8E9100cbfCBCBAdf86b9279fa61526bBB8765',
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
