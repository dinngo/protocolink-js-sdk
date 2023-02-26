/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */

declare namespace Chai {
  interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
    changeBalance(token: any, balance: any, slippage?: number): AsyncAssertion;
  }
}
