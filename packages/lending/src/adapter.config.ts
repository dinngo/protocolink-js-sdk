import {
  arbitrumTokens,
  avalancheTokens,
  baseTokens,
  bnbTokens,
  gnosisTokens,
  mainnetTokens,
  metisTokens,
  optimismTokens,
  polygonTokens,
} from './tokens';
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
    primaryStablecoin: mainnetTokens.USDC,
    secondaryStablecoin: mainnetTokens.DAI,
    primaryNonstablecoin: mainnetTokens.ETH,
  },
  {
    chainId: common.ChainId.polygon,
    primaryStablecoin: polygonTokens['USDC.e'],
    secondaryStablecoin: polygonTokens.DAI,
    primaryNonstablecoin: polygonTokens.MATIC,
  },
  {
    chainId: common.ChainId.arbitrum,
    primaryStablecoin: arbitrumTokens['USDC.e'],
    secondaryStablecoin: arbitrumTokens.DAI,
    primaryNonstablecoin: arbitrumTokens.ETH,
  },
  {
    chainId: common.ChainId.optimism,
    primaryStablecoin: optimismTokens['USDC.e'],
    secondaryStablecoin: optimismTokens.DAI,
    primaryNonstablecoin: optimismTokens.ETH,
  },
  {
    chainId: common.ChainId.avalanche,
    primaryStablecoin: avalancheTokens.USDC,
    secondaryStablecoin: avalancheTokens['DAI.e'],
    primaryNonstablecoin: avalancheTokens.AVAX,
  },
  {
    chainId: common.ChainId.metis,
    primaryStablecoin: metisTokens['m.USDC'],
    secondaryStablecoin: metisTokens['m.DAI'],
    primaryNonstablecoin: metisTokens.METIS,
  },
  {
    chainId: common.ChainId.base,
    primaryStablecoin: baseTokens.USDC,
    secondaryStablecoin: baseTokens.USDbC,
    primaryNonstablecoin: baseTokens.ETH,
  },
  {
    chainId: common.ChainId.gnosis,
    primaryStablecoin: gnosisTokens.WXDAI,
    secondaryStablecoin: gnosisTokens.USDC,
    primaryNonstablecoin: gnosisTokens.XDAI,
  },
  {
    chainId: common.ChainId.bnb,
    primaryStablecoin: bnbTokens.USDT,
    secondaryStablecoin: bnbTokens.USDC,
    primaryNonstablecoin: bnbTokens.BNB,
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
