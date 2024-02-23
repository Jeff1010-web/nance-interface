import { Mainnet } from "./mainnet";
import { Optimism } from "./optimism";
import { Gnosis } from "./gnosis";
import { Goerli } from "./goerli";

export const customChains = [
  Mainnet,
  Optimism,
  Gnosis,
  Goerli,
];

export const getChainByNetworkName = (networkName?: string) => {
  if (!networkName) return customChains[0];
  return customChains.find((c) => c.name.toLowerCase() === networkName.toLowerCase()) || customChains[0];
};

export const getChainById = (chainId?: number) => {
  return customChains.find((c) => c.id === chainId) || customChains[0];
};
