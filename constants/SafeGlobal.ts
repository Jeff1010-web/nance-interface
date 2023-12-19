import { mainnet, goerli, optimism, gnosis } from "wagmi/chains";

export const safeServiceURL = {
  [mainnet.name]: 'mainnet',
  [goerli.name]: 'goerli',
  [optimism.name]: 'optimism',
  [gnosis.name]: 'gnosis-chain',
};

export type SupportedSafeNetwork = keyof typeof safeServiceURL;
