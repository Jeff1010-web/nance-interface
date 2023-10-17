import { mainnet } from 'wagmi/chains';

export function getAddressLink(address: string, network: string) {
  const networkPrefix = network !== mainnet.name ? network.toLowerCase() + "." : "";
  return `https://${networkPrefix}etherscan.io/address/${address}`;
}

export function getTxLink(txHash: string, network: string) {
  const networkPrefix = network !== mainnet.name ? network.toLowerCase() + "." : "";
  return `https://${networkPrefix}etherscan.io/tx/${txHash}`;
}
