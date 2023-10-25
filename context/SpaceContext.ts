import { createContext } from "react";
import { SpaceInfo } from "../models/NanceTypes";

export const SpaceContext = createContext<SpaceInfo | undefined>(undefined);
