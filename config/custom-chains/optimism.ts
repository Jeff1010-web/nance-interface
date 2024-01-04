import { Chain } from "@rainbow-me/rainbowkit";
import { optimism } from "wagmi/chains";

export const Optimism: Chain = {
  ...optimism,
  iconUrl: "/images/chains/optimism.svg",
  rpcUrls: {
    public: {
      http: ["https://rpc.ankr.com/optimism"],
    },
    default: {
      http: [`https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`],
    },
  },
};
