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
    primaryNonstablecoin: polygonTokens.WETH,
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
    primaryNonstablecoin: avalancheTokens['WETH.e'],
  },
  {
    chainId: common.ChainId.metis,
    primaryStablecoin: metisTokens['m.USDC'],
    secondaryStablecoin: metisTokens['m.DAI'],
    primaryNonstablecoin: metisTokens.WETH,
  },
  {
    chainId: common.ChainId.base,
    primaryStablecoin: baseTokens.USDC,
    secondaryStablecoin: baseTokens.USDbC,
    primaryNonstablecoin: baseTokens.WETH,
  },
  {
    chainId: common.ChainId.gnosis,
    primaryStablecoin: gnosisTokens.WXDAI,
    secondaryStablecoin: gnosisTokens.USDC,
    primaryNonstablecoin: gnosisTokens.WETH,
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
