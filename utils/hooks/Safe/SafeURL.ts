import { useContext } from "react";
import { NetworkContext } from "@/context/NetworkContext";
import { mainnet, goerli, optimism, gnosis } from "wagmi/chains";

export const safeServiceURL = {
  [mainnet.name]: 'mainnet',
  [goerli.name]: 'goerli',
  [optimism.name]: 'optimism',
  [gnosis.name]: 'gnosis-chain',
};

export type SupportedSafeNetwork = keyof typeof safeServiceURL;


export const V1 = "api/v1";

export const useSafeNetworkAPI = () => {
  const network = useContext(NetworkContext) as SupportedSafeNetwork;
  return `https://safe-transaction-${safeServiceURL[network]}.safe.global`;
};

export const safeNetworkAPI = (name: SupportedSafeNetwork) => {
  return `https://safe-transaction-${safeServiceURL[name]}.safe.global`;
};