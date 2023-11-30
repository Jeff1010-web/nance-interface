import { createContext } from "react";
import { mainnet } from "wagmi/chains";

export const NetworkContext = createContext<string>(mainnet.name);
