import config from '../../hardhat.config';
import { revert, snapshot } from '@composable-router/test-helpers';

config.mocha = {
  ...config.mocha,
  rootHooks: { beforeEach: [snapshot], afterEach: [revert] },
};

export default config;
