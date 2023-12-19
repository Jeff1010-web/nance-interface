import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { createConfig, configureChains } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { customChains } from "./custom-chains";

// WAGMI and RainbowKit configuration

export const { chains, publicClient } = configureChains(
  customChains,
  [
    jsonRpcProvider({
      rpc: chain => {
        return {
          http: `${chain.rpcUrls.default.http[0]}`,
        };
      },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Nance Interface",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});
