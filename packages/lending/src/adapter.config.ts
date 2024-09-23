import * as common from '@protocolink/common';

interface Config {
  chainId: number;
  primaryStablecoin: common.Token;
  secondaryStablecoin: common.Token;
  primaryNonstablecoin: common.Token;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    primaryStablecoin: common.mainnetTokens.USDC,
    secondaryStablecoin: common.mainnetTokens.DAI,
    primaryNonstablecoin: common.mainnetTokens.ETH,
  },
  {
    chainId: common.ChainId.polygon,
    primaryStablecoin: common.polygonTokens['USDC.e'],
    secondaryStablecoin: common.polygonTokens.DAI,
    primaryNonstablecoin: common.polygonTokens.POL,
  },
  {
    chainId: common.ChainId.arbitrum,
    primaryStablecoin: common.arbitrumTokens['USDC.e'],
    secondaryStablecoin: common.arbitrumTokens.DAI,
    primaryNonstablecoin: common.arbitrumTokens.ETH,
  },
  {
    chainId: common.ChainId.optimism,
    primaryStablecoin: common.optimismTokens['USDC.e'],
    secondaryStablecoin: common.optimismTokens.DAI,
    primaryNonstablecoin: common.optimismTokens.ETH,
  },
  {
    chainId: common.ChainId.avalanche,
    primaryStablecoin: common.avalancheTokens.USDC,
    secondaryStablecoin: common.avalancheTokens['DAI.e'],
    primaryNonstablecoin: common.avalancheTokens.AVAX,
  },
  {
    chainId: common.ChainId.metis,
    primaryStablecoin: common.metisTokens['m.USDC'],
    secondaryStablecoin: common.metisTokens['m.DAI'],
    primaryNonstablecoin: common.metisTokens.METIS,
  },
  {
    chainId: common.ChainId.base,
    primaryStablecoin: common.baseTokens.USDC,
    secondaryStablecoin: common.baseTokens.USDbC,
    primaryNonstablecoin: common.baseTokens.ETH,
  },
  {
    chainId: common.ChainId.gnosis,
    primaryStablecoin: common.gnosisTokens.WXDAI,
    secondaryStablecoin: common.gnosisTokens.USDC,
    primaryNonstablecoin: common.gnosisTokens.xDAI,
  },
  {
    chainId: common.ChainId.bnb,
    primaryStablecoin: common.bnbTokens.USDT,
    secondaryStablecoin: common.bnbTokens.USDC,
    primaryNonstablecoin: common.bnbTokens.BNB,
  },
];

export const [supportedChainIds, configMap] = configs.reduce(
  (accumulator, config) => {
    const { chainId } = config;

    accumulator[0].push(chainId);
    accumulator[1][chainId] = config;

    return accumulator;
  },
  [[], {}] as [number[], Record<number, Config>]
);
