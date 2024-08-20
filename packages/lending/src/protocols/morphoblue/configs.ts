import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';
import { mainnetTokens } from './tokens';

export const ID = 'morphoblue';
export const DISPLAY_NAME = 'Morpho';

export const loanTokenPriceFeedMap: Record<number, Record<string, string>> = {
  [common.ChainId.mainnet]: {
    [mainnetTokens.WETH.address]: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    [mainnetTokens.USDC.address]: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
    [mainnetTokens.USDT.address]: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
    [mainnetTokens.PYUSD.address]: '0x8f1dF6D7F2db73eECE86a18b4381F4707b918FB1',
    [mainnetTokens.DAI.address]: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
    [mainnetTokens.USDA.address]: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6', // use USDC
  },
};

export const supportedChainIds = logics.morphoblue.supportedChainIds;
export const configMap = logics.morphoblue.configMap;
export const marketMap = logics.morphoblue.marketMap;
export const getContractAddress = logics.morphoblue.getContractAddress;

export function getMarket(chainId: number, id: string) {
  const market = marketMap[chainId][id];
  return {
    ...market,
    loanTokenPriceFeedAddress: loanTokenPriceFeedMap[chainId][market.loanToken.address],
  };
}
