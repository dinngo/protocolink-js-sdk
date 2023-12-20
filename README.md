# Protocolink SDK

[![Lint](https://github.com/dinngo/protocolink-js-sdk/actions/workflows/lint.yml/badge.svg)](https://github.com/dinngo/protocolink-js-sdk/actions/workflows/lint.yml)
[![Unit Test](https://github.com/dinngo/protocolink-js-sdk/actions/workflows/unit-test.yml/badge.svg)](https://github.com/dinngo/protocolink-js-sdk/actions/workflows/unit-test.yml)
[![E2E Test](https://github.com/dinngo/protocolink-js-sdk/actions/workflows/e2e-test.yml/badge.svg)](https://github.com/dinngo/protocolink-js-sdk/actions/workflows/e2e-test.yml)

- Help developers build DeFi applications with the Protocolink API without handling API requests and responses.
- Support a wide range of common use cases, including token swaps, flash loans, and supply/borrow actions.
- Support multiple blockchain networks.

More details and examples can be found at [SDK Overview](https://docs.protocolink.com/integrate-js-sdk/overview)

## Packages

- The `api` package empowers developers to interact with the Protocolink API.
- The `common` package empowers developers to deal with general information like token and network.
- The `core` package defines the constants and the interfaces used in the Protocolink API.
- The `lending` package empowers developers to rapidly build intent-centric applications and enhances the user experience for the lending protocols.
- The `test-helpers` package provides utilities for developers to write tests.

| package                                                      | version                                                                                                                             | changelog                                |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [@protocolink/api](packages/api/README.md)                   | [![npm version](https://badge.fury.io/js/@protocolink%2Fapi.svg)](https://www.npmjs.com/package/@protocolink/api)                   | [GO](packages/api/CHANGELOG.md)          |
| [@protocolink/common](packages/common/README.md)             | [![npm version](https://badge.fury.io/js/@protocolink%2Fcommon.svg)](https://www.npmjs.com/package/@protocolink/common)             | [GO](packages/common/CHANGELOG.md)       |
| [@protocolink/core](packages/core/README.md)                 | [![npm version](https://badge.fury.io/js/@protocolink%2Fcore.svg)](https://www.npmjs.com/package/@protocolink/core)                 | [GO](packages/core/CHANGELOG.md)         |
| [@protocolink/lending](packages/lending/README.md)           | [![npm version](https://badge.fury.io/js/@protocolink%2Flending.svg)](https://www.npmjs.com/package/@protocolink/lending)           | [GO](packages/lending/CHANGELOG.md)      |
| [@protocolink/test-helpers](packages/test-helpers/README.md) | [![npm version](https://badge.fury.io/js/@protocolink%2Ftest-helpers.svg)](https://www.npmjs.com/package/@protocolink/test-helpers) | [GO](packages/test-helpers/CHANGELOG.md) |
