import {
  ChainId,
  ExplorerType,
  NetworkId,
  getNetwork,
  isSupportedChainId,
  isSupportedNetworkId,
  networks,
  newExplorerUrl,
  setNetwork,
} from './index';
import { expect } from 'chai';

describe('Test isSupportedChainId', function () {
  const testCases = [
    { chainId: ChainId.mainnet, expected: true },
    { chainId: ChainId.optimism, expected: true },
    { chainId: ChainId.bnb, expected: true },
    { chainId: ChainId.gnosis, expected: true },
    { chainId: ChainId.polygon, expected: true },
    { chainId: ChainId.zksync, expected: true },
    { chainId: ChainId.metis, expected: true },
    { chainId: ChainId.polygonZkevm, expected: true },
    { chainId: ChainId.base, expected: true },
    { chainId: ChainId.iota, expected: true },
    { chainId: ChainId.arbitrum, expected: true },
    { chainId: ChainId.avalanche, expected: true },
    { chainId: 1337, expected: false },
  ];

  testCases.forEach(({ chainId, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(isSupportedChainId(chainId)).to.eq(expected);
    });
  });
});

describe('Test isSupportedNetworkId', function () {
  const testCases = [
    { networkId: NetworkId.mainnet, expected: true },
    { networkId: NetworkId.optimism, expected: true },
    { networkId: NetworkId.bnb, expected: true },
    { networkId: NetworkId.gnosis, expected: true },
    { networkId: NetworkId.polygon, expected: true },
    { networkId: NetworkId.zksync, expected: true },
    { networkId: NetworkId.metis, expected: true },
    { networkId: NetworkId.polygonZkevm, expected: true },
    { networkId: NetworkId.base, expected: true },
    { networkId: NetworkId.iota, expected: true },
    { networkId: NetworkId.arbitrum, expected: true },
    { networkId: NetworkId.avalanche, expected: true },
    { networkId: 'hardhat', expected: false },
  ];

  testCases.forEach(({ networkId, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(isSupportedNetworkId(networkId)).to.eq(expected);
    });
  });
});

describe('Test newExplorerUrl', function () {
  const testCases = [
    {
      chainId: ChainId.mainnet,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected: 'https://etherscan.io/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.mainnet,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://etherscan.io/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.mainnet,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      chainId: ChainId.optimism,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected: 'https://optimistic.etherscan.io/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.optimism,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://optimistic.etherscan.io/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.optimism,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://optimistic.etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      chainId: ChainId.bnb,
      type: ExplorerType.tx,
      data: '0xc1a754e55b9c72a98c0c8136e4499e9fdb2148894c8bddc837c6c5c3bb3833a7',
      expected: 'https://bscscan.com/tx/0xc1a754e55b9c72a98c0c8136e4499e9fdb2148894c8bddc837c6c5c3bb3833a7',
    },
    {
      chainId: ChainId.bnb,
      type: ExplorerType.address,
      data: '0x5cf810ab8c718ac065b45f892a5badab2b2946b9',
      expected: 'https://bscscan.com/address/0x5cf810ab8c718ac065b45f892a5badab2b2946b9',
    },
    {
      chainId: ChainId.bnb,
      type: ExplorerType.token,
      data: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      expected: 'https://bscscan.com/token/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    },
    {
      chainId: ChainId.gnosis,
      type: ExplorerType.tx,
      data: '0xc371ef1ef7f36da374c9d1dbbf124bc0fc137245377d6acbf0d392addb6620dc',
      expected: 'https://gnosisscan.io/tx/0xc371ef1ef7f36da374c9d1dbbf124bc0fc137245377d6acbf0d392addb6620dc',
    },
    {
      chainId: ChainId.gnosis,
      type: ExplorerType.address,
      data: '0x157253E7012bf08b24dDA7Fc16229d14d9f9833D',
      expected: 'https://gnosisscan.io/address/0x157253E7012bf08b24dDA7Fc16229d14d9f9833D',
    },
    {
      chainId: ChainId.gnosis,
      type: ExplorerType.token,
      data: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
      expected: 'https://gnosisscan.io/token/0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    },
    {
      chainId: ChainId.polygon,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected: 'https://polygonscan.com/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.polygon,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://polygonscan.com/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.polygon,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://polygonscan.com/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      chainId: ChainId.zksync,
      type: ExplorerType.tx,
      data: '0xf2796c0c8814a8fb37e30fef66a43b872803921d7d674b87916959ae57efcc71',
      expected: 'https://explorer.zksync.io/tx/0xf2796c0c8814a8fb37e30fef66a43b872803921d7d674b87916959ae57efcc71',
    },
    {
      chainId: ChainId.zksync,
      type: ExplorerType.address,
      data: '0x460f500EFfDC9d9ddD120f2812ff409bFdff47fA',
      expected: 'https://explorer.zksync.io/address/0x460f500EFfDC9d9ddD120f2812ff409bFdff47fA',
    },
    {
      chainId: ChainId.metis,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected:
        'https://andromeda-explorer.metis.io/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.metis,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://andromeda-explorer.metis.io/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.metis,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://andromeda-explorer.metis.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      chainId: ChainId.polygonZkevm,
      type: ExplorerType.tx,
      data: '0x49ac3d94251609fda7a4149c82ac9d6fc4d1bfcea4a66b33b0cf6c1d28d0a7ab',
      expected: 'https://zkevm.polygonscan.com/tx/0x49ac3d94251609fda7a4149c82ac9d6fc4d1bfcea4a66b33b0cf6c1d28d0a7ab',
    },
    {
      chainId: ChainId.polygonZkevm,
      type: ExplorerType.address,
      data: '0xc32daf8c6a2f9f27ed2e148bc4f59230bc85205d',
      expected: 'https://zkevm.polygonscan.com/address/0xc32daf8c6a2f9f27ed2e148bc4f59230bc85205d',
    },
    {
      chainId: ChainId.polygonZkevm,
      type: ExplorerType.token,
      data: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
      expected: 'https://zkevm.polygonscan.com/token/0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
    },
    {
      chainId: ChainId.base,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected: 'https://basescan.org/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.base,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://basescan.org/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.base,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://basescan.org/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      chainId: ChainId.iota,
      type: ExplorerType.tx,
      data: '0x48f4ddb20e424dc9bfa240708f5016dbe47ecfe025ec6f09530fca553da6bf6a',
      expected: 'https://explorer.evm.iota.org/tx/0x48f4ddb20e424dc9bfa240708f5016dbe47ecfe025ec6f09530fca553da6bf6a',
    },
    {
      chainId: ChainId.iota,
      type: ExplorerType.address,
      data: '0x41e596Aef13e868D8d6861F93Af08804D01F272f',
      expected: 'https://explorer.evm.iota.org/address/0x41e596Aef13e868D8d6861F93Af08804D01F272f',
    },
    {
      chainId: ChainId.iota,
      type: ExplorerType.token,
      data: '0x6e47f8d48a01b44DF3fFF35d258A10A3AEdC114c',
      expected: 'https://explorer.evm.iota.org/token/0x6e47f8d48a01b44DF3fFF35d258A10A3AEdC114c',
    },
    {
      chainId: ChainId.arbitrum,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected: 'https://arbiscan.io/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.arbitrum,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://arbiscan.io/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.arbitrum,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://arbiscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      chainId: ChainId.avalanche,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected: 'https://snowtrace.io/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.avalanche,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://snowtrace.io/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.avalanche,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://snowtrace.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
  ];

  testCases.forEach(({ chainId, type, data, expected }, i) => {
    it(`case ${i + 1}`, function () {
      expect(newExplorerUrl(chainId, type, data)).to.eq(expected);
    });
  });
});

describe('Test setNetwork', function () {
  const testCases: { chainId: number; network: Record<string, any> }[] = [
    {
      chainId: ChainId.mainnet,
      network: {
        rpcUrl: 'https://ethtaipei-node.furucombo.app/node',
        explorerUrl: 'https://ethtaipei-node.furucombo.app/',
      },
    },
  ];

  testCases.forEach(({ chainId, network }, i) => {
    it(`case ${i + 1}`, function () {
      const oldNetwork = getNetwork(chainId);

      setNetwork(chainId, network);

      for (let i = 0; i < networks.length; i++) {
        if (networks[i].chainId === chainId) {
          Object.keys(network).forEach((key) => {
            expect((networks[i] as Record<string, any>)[key]).to.eq(network[key]);
          });
          break;
        }
      }

      const newNetwork: Record<string, any> = getNetwork(chainId);
      Object.keys(network).forEach((key) => {
        expect(newNetwork[key]).to.eq(network[key]);
      });

      setNetwork(chainId, oldNetwork);
    });
  });
});

describe('Chain 138 network metadata', function () {
  it('has ChainId and NetworkId constants', function () {
    expect(ChainId.chain138).to.eq(138);
    expect(NetworkId.chain138).to.eq('chain138');
    expect(isSupportedChainId(ChainId.chain138)).to.be.true;
    expect(isSupportedNetworkId(NetworkId.chain138)).to.be.true;
  });

  it('has explorer, Multicall3, native, and wrapped native metadata', function () {
    const network = getNetwork(ChainId.chain138);

    expect(network.id).to.eq(NetworkId.chain138);
    expect(network.chainId).to.eq(138);
    expect(network.name).to.eq('DeFi Oracle Meta Mainnet');
    expect(network.explorerUrl).to.eq('https://blockscout.defi-oracle.io/');
    expect(network.rpcUrl).to.eq('https://rpc.d-bis.org');
    expect(network.multicall3Address).to.eq('0xcA11bde05977b3631167028862bE2a173976CA11');

    expect(network.nativeToken).to.include({
      chainId: 138,
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
    });
    expect(network.wrappedNativeToken).to.include({
      chainId: 138,
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      symbol: 'WETH',
      name: 'Wrapped Ether',
    });
  });

  it('builds Blockscout explorer URLs', function () {
    const txHash = '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743';
    const address = '0xDec80E988F4baF43be69c13711453013c212feA8';

    expect(newExplorerUrl(ChainId.chain138, ExplorerType.tx, txHash)).to.eq(
      `https://blockscout.defi-oracle.io/tx/${txHash}`
    );
    expect(newExplorerUrl(ChainId.chain138, ExplorerType.address, address)).to.eq(
      `https://blockscout.defi-oracle.io/address/${address}`
    );
    expect(newExplorerUrl(ChainId.chain138, ExplorerType.token, address)).to.eq(
      `https://blockscout.defi-oracle.io/token/${address}`
    );
  });
});
