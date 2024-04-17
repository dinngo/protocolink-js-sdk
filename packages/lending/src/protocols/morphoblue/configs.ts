import * as common from '@protocolink/common';
import { mainnetTokens } from './tokens';

export const ID = 'morphoblue';
export const DISPLAY_NAME = 'Morpho Blue';

type ContractNames = 'Morpho' | 'MorphoFlashLoanCallback';

export interface MarketConfig {
  id: string;
  loanToken: common.Token;
  collateralToken: common.Token;
  oracle: string;
  irm: string;
  lltv: string;
  loanTokenPriceFeedAddress: string;
}

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
  markets: MarketConfig[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      Morpho: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
      MorphoFlashLoanCallback: '0x24D5b6b712D1f0D0B628E21E39dBaDde3f28C56e',
    },
    markets: [
      {
        id: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        loanToken: mainnetTokens.WETH,
        collateralToken: mainnetTokens.wstETH,
        oracle: '0x2a01EB9496094dA03c4E364Def50f5aD1280AD72',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '945000000000000000',
        loanTokenPriceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      },
      {
        id: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        loanToken: mainnetTokens.USDC,
        collateralToken: mainnetTokens.wstETH,
        oracle: '0x48F7E36EB6B826B2dF4B2E630B62Cd25e89E40e2',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
        loanTokenPriceFeedAddress: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
      },
      {
        id: '0xa921ef34e2fc7a27ccc50ae7e4b154e16c9799d3387076c421423ef52ac4df99',
        loanToken: mainnetTokens.USDT,
        collateralToken: mainnetTokens.WBTC,
        oracle: '0x008bF4B1cDA0cc9f0e882E0697f036667652E1ef',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
        loanTokenPriceFeedAddress: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
      },
      {
        id: '0x698fe98247a40c5771537b5786b2f3f9d78eb487b4ce4d75533cd0e94d88a115',
        loanToken: mainnetTokens.WETH,
        collateralToken: mainnetTokens.weETH,
        oracle: '0x3fa58b74e9a8eA8768eb33c8453e9C2Ed089A40a',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
        loanTokenPriceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      },
      {
        id: '0x3a85e619751152991742810df6ec69ce473daef99e28a64ab2340d7b7ccfee49',
        loanToken: mainnetTokens.USDC,
        collateralToken: mainnetTokens.WBTC,
        oracle: '0xDddd770BADd886dF3864029e4B377B5F6a2B6b83',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
        loanTokenPriceFeedAddress: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
      },
      {
        id: '0xd5211d0e3f4a30d5c98653d988585792bb7812221f04801be73a44ceecb11e89',
        loanToken: mainnetTokens.WETH,
        collateralToken: mainnetTokens.osETH,
        oracle: '0x224F2F1333b45E34fFCfC3bD01cE43C73A914498',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
        loanTokenPriceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      },
      {
        id: '0xe7e9694b754c4d4f7e21faf7223f6fa71abaeb10296a4c43a54a7977149687d2',
        loanToken: mainnetTokens.USDT,
        collateralToken: mainnetTokens.wstETH,
        oracle: '0x95DB30fAb9A3754e42423000DF27732CB2396992',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
        loanTokenPriceFeedAddress: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
      },
      {
        id: '0x124ddf1fa02a94085d1fcc35c46c7e180ddb8a0d3ec1181cf67a75341501c9e6',
        loanToken: mainnetTokens.PYUSD,
        collateralToken: mainnetTokens.wstETH,
        oracle: '0x27679a17b7419fB10Bd9D143f21407760fdA5C53',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
        loanTokenPriceFeedAddress: '0x8f1dF6D7F2db73eECE86a18b4381F4707b918FB1',
      },
      {
        id: '0x49bb2d114be9041a787432952927f6f144f05ad3e83196a7d062f374ee11d0ee',
        loanToken: mainnetTokens.WETH,
        collateralToken: mainnetTokens.ezETH,
        oracle: '0x61025e2B0122ac8bE4e37365A4003d87ad888Cc3',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
        loanTokenPriceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      },
      {
        id: '0x1929f8139224cb7d5db8c270addc9ce366d37ad279e1135f73c0adce74b0f936',
        loanToken: mainnetTokens.WETH,
        collateralToken: mainnetTokens.sDAI,
        oracle: '0x0f9bb760D76af1B5Ca89102084E1963F6698AFda',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
        loanTokenPriceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      },
      {
        id: '0x1247f1c237eceae0602eab1470a5061a6dd8f734ba88c7cdc5d6109fb0026b28',
        loanToken: mainnetTokens.DAI,
        collateralToken: mainnetTokens.sUSDe,
        oracle: '0x5D916980D5Ae1737a8330Bf24dF812b2911Aae25',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '915000000000000000',
        loanTokenPriceFeedAddress: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
      },
      {
        id: '0x8bbd1763671eb82a75d5f7ca33a0023ffabdd9d1a3d4316f34753685ae988e80',
        loanToken: mainnetTokens.WETH,
        collateralToken: mainnetTokens.apxETH,
        oracle: '0x037D67A5E6F19d0Fb26A6603d2D4fE9d70eC3258',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
        loanTokenPriceFeedAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      },
      {
        id: '0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c',
        loanToken: mainnetTokens.DAI,
        collateralToken: mainnetTokens.USDe,
        oracle: '0xaE4750d0813B5E37A51f7629beedd72AF1f9cA35',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '915000000000000000',
        loanTokenPriceFeedAddress: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
      },
      {
        id: '0x97bb820669a19ba5fa6de964a466292edd67957849f9631eb8b830c382f58b7f',
        loanToken: mainnetTokens.USDC,
        collateralToken: mainnetTokens.MKR,
        oracle: '0x6686788B4315A4F93d822c1Bf73910556FCe2d5a',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '770000000000000000',
        loanTokenPriceFeedAddress: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
      },
      {
        id: '0xdc5333039bcf15f1237133f74d5806675d83d9cf19cfd4cfdd9be674842651bf',
        loanToken: mainnetTokens.USDT,
        collateralToken: mainnetTokens.sUSDe,
        oracle: '0xE47E36457D0cF83A74AE1e45382B7A044f7abd99',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '915000000000000000',
        loanTokenPriceFeedAddress: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
      },
    ],
  },
];

export const [supportedChainIds, configMap, marketMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    accumulator[2][config.chainId] = {};
    for (const market of config.markets) {
      accumulator[2][config.chainId][market.id] = market;
    }
    return accumulator;
  },
  [[], {}, {}] as [number[], Record<number, Config>, Record<number, Record<string, MarketConfig>>]
);

export function getContractAddress(chainId: number, name: ContractNames) {
  return configMap[chainId].contract[name];
}

export function getMarkets(chainId: number) {
  return configMap[chainId].markets;
}

export function getMarket(chainId: number, id: string) {
  return marketMap[chainId][id];
}
