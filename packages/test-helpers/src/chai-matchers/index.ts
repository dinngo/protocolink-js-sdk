import './types';

import { supportChangeBalance } from './change-balance';
import { use } from 'chai';

use(function (chai, utils) {
  supportChangeBalance(chai.Assertion, utils);
});
