import * as common from '@protocolink/common';
import { mainnetTokens, polygonTokens, arbitrumTokens } from '@protocolink/test-helpers';

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
    primaryStablecoin: polygonTokens.USDC,
    secondaryStablecoin: polygonTokens.DAI,
    primaryNonstablecoin: polygonTokens.WETH,
  },
  {
    chainId: common.ChainId.arbitrum,
    primaryStablecoin: arbitrumTokens['USDC.e'],
    secondaryStablecoin: arbitrumTokens.DAI,
    primaryNonstablecoin: arbitrumTokens.ETH,
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
