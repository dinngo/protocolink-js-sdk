import { HardhatUserConfig } from 'hardhat/config';
import rootConfig from '../../hardhat.config';
import { setup } from 'test/hooks';

const config: HardhatUserConfig = {
  ...rootConfig,
  mocha: {
    ...rootConfig.mocha,
    rootHooks: { beforeAll: [setup] },
  },
};

export default config;
