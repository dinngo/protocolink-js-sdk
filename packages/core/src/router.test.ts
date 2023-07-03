import { calcAccountAgent } from './router';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { setContractAddress } from './config';

describe('Test newLogic', function () {
  const testCases = [
    {
      chainId: common.ChainId.mainnet,
      routerAddress: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
      agentImplementationAddress: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
      account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
      expected: '0x0b3B738Ee870144575656768cA4A912809b969C5',
    },
    {
      chainId: common.ChainId.mainnet,
      routerAddress: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
      agentImplementationAddress: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
      account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
      expected: '0x3371FB693DAE5C4b2AE8A0C9124a64cb7f38391a',
    },
    {
      chainId: common.ChainId.zksync,
      routerAddress: '0xff4F3b46d68620FaBbBB788Ca2FE8759ac2a544E',
      agentImplementationAddress: '0x6A76BBbd761110a4ff403Ce855d3ffb2Ca1bA74f',
      account: '0x5cb738DAe833Ec21fe65ae1719fAd8ab8cE7f23D',
      expected: '0xF08498743E89deD67d44aD5952DaCF50FFEaCB34',
    },
    {
      chainId: common.ChainId.zksync,
      routerAddress: '0xff4F3b46d68620FaBbBB788Ca2FE8759ac2a544E',
      agentImplementationAddress: '0x6A76BBbd761110a4ff403Ce855d3ffb2Ca1bA74f',
      account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
      expected: '0xC62cAD7b6C2D1daD91abC9aD0DbaB3376C14eae2',
    },
  ];

  testCases.forEach(({ chainId, routerAddress, agentImplementationAddress, account, expected }, i) => {
    it(`case ${i + 1}`, function () {
      setContractAddress(chainId, 'Router', routerAddress);
      setContractAddress(chainId, 'AgentImplementation', agentImplementationAddress);
      const accountAgent = calcAccountAgent(chainId, account);
      expect(accountAgent).to.eq(expected);
    });
  });
});
