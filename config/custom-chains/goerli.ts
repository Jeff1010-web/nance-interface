import { Chain } from "@rainbow-me/rainbowkit";
import { goerli } from "wagmi/chains";

export const Goerli: Chain = {
  ...goerli,
  rpcUrls: {
    public: {
      http: ["https://rpc.ankr.com/eth_goerli"],
    },
    default: {
      http: [`https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`],
    },
  },
};
