import 'src/chai-matchers';

import config from '../../hardhat.config';
import { revert, snapshot } from 'src/utils';

config.mocha = {
  ...config.mocha,
  rootHooks: { beforeEach: [snapshot], afterEach: [revert] },
};

export default config;
