import { Chain } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";

export const Mainnet: Chain = {
  ...mainnet,
  iconUrl: "/images/chains/ethereum.svg",
  rpcUrls: {
    public: {
      http: ["https://eth.llamarpc.com"],
    },
    default: {
      http: [`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`],
    },
  },
};
