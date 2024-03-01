# @protocolink/lending

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
