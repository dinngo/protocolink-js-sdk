// https://github.com/mochajs/mocha/blob/master/example/config/.mocharc.js

module.exports = {
  extension: 'ts',
  require: [
    'ts-node/register',
    '@nomicfoundation/hardhat-chai-matchers/internal/add-chai-matchers',
    'test/unit-test-init.ts',
  ],
  timeout: 30000,
};
