export async function getChainId() {
  const hre = await import('hardhat');
  const network = await hre.ethers.provider.getNetwork();
  return network.chainId;
}

let snapshotId: string;

export async function snapshot() {
  const hre = await import('hardhat');
  snapshotId = await hre.network.provider.send('evm_snapshot', []);
}

export async function revert() {
  const hre = await import('hardhat');
  await hre.network.provider.send('evm_revert', [snapshotId]);
}
