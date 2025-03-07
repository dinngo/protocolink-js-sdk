# @protocolink/lending

## 2.1.8

### Patch Changes

- b2fa58f: Update dependencies

## 2.1.7

### Patch Changes

- bc566ec: Support radiant v2 on Arbitrum, BNB and Update dependencies
  - @protocolink/api@1.4.7
  - @protocolink/logics@1.8.8

## 2.1.6

### Patch Changes

- e8c0b6b: Update dependencies
  - @protocolink/api@1.4.6
  - @protocolink/logics@1.8.7

## 2.1.5

### Patch Changes

- e17aed2: Update dependencies
  - @protocolink/logics@1.8.6
  - @protocolink/api@1.4.5

## 2.1.4

### Patch Changes

- d037bb9: update Aave V3 PoolDataProvider addresses

## 2.1.3

### Patch Changes

- 6fad897: Update dependencies & migrate POL
- 5afd6bf: fix getReserveTokens differs from getDepositTokenList, getBorrowTokenList when listing a new token

## 2.1.2

### Patch Changes

- 29d51dd: optimize morphoblue getPortfolios multicall, fix compound-v3 type and private props
- Updated dependencies [8c684b2]
  - @protocolink/api@1.3.3

## 2.1.1

### Patch Changes

- 3960c5a: Update dependencies
  - @protocolink/api@1.2.4
  - @protocolink/common@0.5.3
  - @protocolink/core@0.6.2
  - @protocolink/logics@1.6.2

## 2.1.0

### Minor Changes

- e309c92: implement reserves data caching

### Patch Changes

- b4a8464: support radiant v2 on base

## 2.0.1

### Patch Changes

- ca67262: adjust reserve tokens, supply tokens, borrow tokens
- Updated dependencies [2ba93e6]
- Updated dependencies [2bc567b]
  - @protocolink/api@1.2.1

## 2.0.0

### Major Changes

- 79b6b4d: adapter, protocol use async to init config

## 1.3.0

### Minor Changes

- 39f690d: support blocktag for getPortfolios

## 1.2.0

### Minor Changes

- e8fd934: add weeth to radiant

### Patch Changes

- 9d8882c: fix config primaryNonstablecoin

## 1.1.0

### Minor Changes

- bump version 1.1.0

### Patch Changes

- d552ac5: fix test grossApy
- 8b8622c: add BNB Chain info to Radiant V2

## 1.0.16

### Patch Changes

- f63b7d5: add morphoblue markets
- Updated dependencies [eee1bfc]
  - @protocolink/api@1.0.15

## 1.0.15

### Patch Changes

- b1022ff: support LST APY

## 1.0.14

### Patch Changes

- 1aa3220: rename polygon USDC to USDCe

## 1.0.13

### Patch Changes

- 09fcec0: add canOpenByCollateral, canOpenByDebt, and canClose
- 7562b1d: add open position and close position

## 1.0.12

### Patch Changes

- 9213967: add morphoblue markets
- e527dd5: build positions in e2e tests

## 1.0.11

### Patch Changes

- 2d5a103: add arbitrum radiant v2 native USDC

## 1.0.10

### Patch Changes

- 999793b: fix new protocol and chain token list

## 1.0.9

### Patch Changes

- 3055522: add mainnet setNetwork in hooks.ts
- 7f83ad7: rename bridged USDC to USDC.e
- ae2f2b8: remove approval check in e2e test
- ea0815c: add Compound V3 on Base
- 8c2d595: add Spark on Ethereum
- 3c27c95: add AAVE V3 on Base and Gnosis
- 6c9c019: add isRepayAll to lending sdk
- b81282c: add AAVE V3, Compound V3 lending protocol test

## 1.0.8

### Patch Changes

- d02be87: add morphoblue lending sdk
- 552726c: fix ci test

## 1.0.7

### Patch Changes

- a9fb09f: fix leverage short swap quotation issue
- Updated dependencies [d14aeb2]
  - @protocolink/api@1.0.11

## 1.0.6

### Patch Changes

- 01bd7b2: add jsdoc info to lending
- a76d70b: add swapper quote error handling

## 1.0.5

### Patch Changes

- b5a7fdb: add supply, borrow caps validation
- 03e3fb4: zap borrow add borrow min validation

## 1.0.4

### Patch Changes

- b842583: fix radiant v2 USDC symbol to USDC.e

## 1.0.3

### Patch Changes

- 20e6cc4: fix portfolio utilization issue

## 1.0.2

### Patch Changes

- e1815cb: Updated dependencies
  - @protocolink/api@1.0.3
  - @protocolink/common@0.3.5
  - @protocolink/core@0.4.5
  - @protocolink/logics@1.0.3

## 1.0.1

### Patch Changes

- b75429a: specify the preferredFlashLoanProtocolId of radiant v2
- b005fc3: openocean get exact out quotation issue
- 7ca900e: refine adapter scale repay amount mechanism

## 1.0.0

### Patch Changes

- The first version release for lending sdk.
