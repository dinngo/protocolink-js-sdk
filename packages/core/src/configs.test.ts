import * as common from '@protocolink/common';
import { getContractAddress } from './configs';
import { expect } from 'chai';

describe('Chain 138 contract configs', function () {
  it('maps Chain 138 to the live fallback Protocolink Router address', function () {
    expect(getContractAddress(common.ChainId.chain138, 'Router')).to.eq('0xE7f51632381d0791eC5c05F5585e7b1bFf1de5F5');
  });
});
