import { Proposal } from "@nance/nance-sdk";
import { createContext } from "react";

export const ProposalMetadataContext = createContext({
  loadedProposal: {} as Proposal | undefined,
  fork: false as boolean,
  space: "" as string,
});
