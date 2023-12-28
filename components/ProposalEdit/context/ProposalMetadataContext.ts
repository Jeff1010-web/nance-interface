import { Proposal } from "@/models/NanceTypes";
import { createContext } from "react";

export const ProposalMetadataContext = createContext({
  loadedProposal: null as Proposal | null,
  fork: false as boolean,
  space: "" as string,
});
