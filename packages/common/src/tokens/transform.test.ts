import { TokenAmount, isTokenAmount, isTokenAmounts } from './token-amount';
import { classifying } from './transform';
import { expect } from 'chai';
import { isToken } from './token';
import { mainnetTokens } from './utils';

describe('Test classifying', function () {
  it('TokenToTokenExactInFields', function () {
    const fieldsObject = {
      input: { token: mainnetTokens.ETH, amount: '1' },
      output: { token: mainnetTokens.USDC, amount: '1' },
    };
    const fields = classifying(fieldsObject);
    expect(isTokenAmount(fields.input)).to.be.true;
    expect(isTokenAmount(fields.output)).to.be.true;
  });

  it('TokenToTokenExactInParams', function () {
    const fieldsObject = {
      input: { token: mainnetTokens.ETH, amount: '1' },
      tokenOut: mainnetTokens.USDC,
    };
    const fields = classifying(fieldsObject);
    expect(isTokenAmount(fields.input)).to.be.true;
    expect(isToken(fields.tokenOut)).to.be.true;
  });

  it('TokensIn', function () {
    const fieldsObject = [
      { token: mainnetTokens.ETH, amount: '1' },
      { token: mainnetTokens.ETH, amount: '1' },
    ];

    const fields = classifying(fieldsObject);
    expect(isTokenAmounts(fields)).to.be.true;
  });

  it('TokensInFields', function () {
    const fieldsObject = {
      inputs: [
        { token: mainnetTokens.ETH, amount: '1' },
        { token: mainnetTokens.ETH, amount: '1' },
      ],
    };
    const fields = classifying(fieldsObject);
    expect(isTokenAmounts(fields.inputs)).to.be.true;
  });

  it('MultiSendFields', function () {
    const fieldsObject = [
      { input: { token: mainnetTokens.ETH, amount: '1' }, recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      { input: { token: mainnetTokens.WETH, amount: '1' }, recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      { input: { token: mainnetTokens.USDC, amount: '1' }, recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
    ];
    const fields = classifying(fieldsObject);
    for (const item of fields) {
      expect(isTokenAmount(item.input)).to.be.true;
    }
  });

  it('Nested Object', function () {
    const fieldsObject = [
      {
        baseToken: {
          chainId: 137,
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          decimals: 6,
          symbol: 'USDC',
          name: 'USD Coin (PoS)',
        },
        baseTokenPrice: '0.99995719',
        supplyApr: '0.0258',
        supplyBalance: '0',
        supplyValue: '0',
        borrowApr: '0.0428',
        borrowBalance: '171.00092',
        borrowValue: '170.99',
        collateralValue: '350.78',
        borrowCapacity: '271.863264',
        borrowCapacityValue: '271.85',
        availableToBorrow: '100.862344',
        availableToBorrowValue: '100.86',
        liquidationLimit: '289.39',
        liquidationThreshold: '0.825',
        liquidationRisk: '0.59',
        liquidationPoint: '206.966872',
        liquidationPointValue: '206.96',
        utilization: '0.629',
        healthRate: '1.69',
        netApr: '-0.0209',
        collaterals: [
          {
            asset: {
              chainId: 137,
              address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
              decimals: 18,
              symbol: 'WETH',
              name: 'Wrapped Ether',
            },
            assetPrice: '1901.797',
            borrowCollateralFactor: '0.775',
            liquidateCollateralFactor: '0.825',
            collateralBalance: '0.184444655243193813',
            collateralValue: '350.78',
            borrowCapacity: '271.863264',
            borrowCapacityValue: '271.85',
          },
          {
            asset: {
              chainId: 137,
              address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
              decimals: 8,
              symbol: 'WBTC',
              name: '(PoS) Wrapped BTC',
            },
            assetPrice: '30035.14459631',
            borrowCollateralFactor: '0.7',
            liquidateCollateralFactor: '0.75',
            collateralBalance: '0',
            collateralValue: '0',
            borrowCapacity: '0',
            borrowCapacityValue: '0',
          },
          {
            asset: {
              chainId: 137,
              address: '0x0000000000000000000000000000000000001010',
              decimals: 18,
              symbol: 'MATIC',
              name: 'Matic Token',
            },
            assetPrice: '0.75599807',
            borrowCollateralFactor: '0.65',
            liquidateCollateralFactor: '0.7',
            collateralBalance: '0',
            collateralValue: '0',
            borrowCapacity: '0',
            borrowCapacityValue: '0',
          },
        ],
      },
    ];

    const fields = classifying(fieldsObject);
    for (const item of fields) {
      expect(isToken(item.baseToken)).to.be.true;
      for (const collateral of item.collaterals) {
        expect(isToken(collateral.asset)).to.be.true;
      }
    }
  });

  it('TokenAmountFields', function () {
    const fieldsObject = {
      id: '0383748f-cb39-4d4b-8082-3cebb126a0d4',
      protocolId: 'balancer-v2',
      outputs: [
        TokenAmount.from({
          token: {
            chainId: 1,
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            decimals: 18,
            symbol: 'WETH',
            name: 'Wrapped Ether',
          },
          amount: '1',
        }),
      ],
      isLoan: true,
    };
    const fields = classifying(fieldsObject);
    expect(isTokenAmounts(fields.outputs)).to.be.true;
  });
});
