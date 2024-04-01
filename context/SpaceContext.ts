import { createContext } from "react";
import { SpaceInfo } from "@nance/nance-sdk";

export const SpaceContext = createContext<SpaceInfo | undefined>(undefined);
