import { Chain } from "@rainbow-me/rainbowkit";
import { gnosis } from "wagmi/chains";

export const Gnosis: Chain = {
  ...gnosis,
  iconUrl: "/images/gnosis.png",
  rpcUrls: {
    public: {
      http: ["https://rpc.ankr.com/gnosis"],
    },
    default: {
      http: ["https://rpc.ankr.com/gnosis"],
    },
  },
};
