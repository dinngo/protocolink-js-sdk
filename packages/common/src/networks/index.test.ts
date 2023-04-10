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
    { chainId: ChainId.polygon, expected: true },
    { chainId: ChainId.arbitrum, expected: true },
    { chainId: ChainId.optimism, expected: true },
    { chainId: ChainId.avalanche, expected: true },
    { chainId: ChainId.fantom, expected: true },
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
    { networkId: NetworkId.polygon, expected: true },
    { networkId: NetworkId.arbitrum, expected: true },
    { networkId: NetworkId.optimism, expected: true },
    { networkId: NetworkId.avalanche, expected: true },
    { networkId: NetworkId.fantom, expected: true },
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
      chainId: ChainId.polygon,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected: 'https://polygonscan.com/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.arbitrum,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected: 'https://arbiscan.io/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.optimism,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected: 'https://optimistic.etherscan.io/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.avalanche,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected: 'https://snowtrace.io/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.fantom,
      type: ExplorerType.tx,
      data: '0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
      expected: 'https://ftmscan.com/tx/0x7b00ad829b19ebd4df94f8b5cd0120d300d67482d41755dd5d259defb0164743',
    },
    {
      chainId: ChainId.mainnet,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://etherscan.io/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.polygon,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://polygonscan.com/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.arbitrum,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://arbiscan.io/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.optimism,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://optimistic.etherscan.io/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.avalanche,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://snowtrace.io/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.fantom,
      type: ExplorerType.address,
      data: '0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
      expected: 'https://ftmscan.com/address/0xd8c1cecca51d5d97a70a35e194bb6670b85d8576',
    },
    {
      chainId: ChainId.mainnet,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      chainId: ChainId.polygon,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://polygonscan.com/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      chainId: ChainId.arbitrum,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://arbiscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      chainId: ChainId.optimism,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://optimistic.etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      chainId: ChainId.avalanche,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://snowtrace.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      chainId: ChainId.fantom,
      type: ExplorerType.token,
      data: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      expected: 'https://ftmscan.com/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
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
