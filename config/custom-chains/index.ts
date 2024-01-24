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

export const getChainByNetworkName = (networkName: string) => {
  return customChains.find((c) => c.name.toLowerCase() === networkName) || customChains[0];
};
