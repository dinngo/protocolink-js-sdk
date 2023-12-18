import * as common from '@protocolink/common';
import * as logics from '@protocolink/logics';

export const ID = 'openocean-v2';

export const supportedChainIds = logics.openoceanv2.SwapTokenLogic.supportedChainIds;

export const disabledDexIdsMap: { [key in number]?: string } = {
  [common.ChainId.gnosis]: '6', // BalancerV2
};
