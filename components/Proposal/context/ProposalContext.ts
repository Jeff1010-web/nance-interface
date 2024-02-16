import { Action } from "@/models/NanceTypes";
import { SnapshotProposal } from "@/models/SnapshotTypes";
import { createContext } from "react";

export interface ProposalCommonProps {
  space: string;
  snapshotSpace: string;
  status: string;
  title: string;
  author: string;
  coauthors: string[];
  body: string;
  created: number;
  end: number;
  snapshot: string;
  snapshotHash: string;
  ipfs: string;
  discussion: string;
  governanceCycle?: number;
  uuid: string;
  actions: Action[];
  proposalId: string;
  minTokenPassingAmount: number;
}

export const ProposalContext = createContext<{
  commonProps: ProposalCommonProps;
  proposalInfo: SnapshotProposal | undefined;
  nextProposalId: number;
}>({
  commonProps: {
    space: "",
    snapshotSpace: "",
    status: "",
    title: "",
    author: "",
    coauthors: [],
    body: "",
    created: 0,
    end: 0,
    snapshot: "",
    snapshotHash: "",
    ipfs: "",
    discussion: "",
    governanceCycle: 0,
    uuid: "",
    actions: [],
    proposalId: "",
    minTokenPassingAmount: 0,
  },
  proposalInfo: undefined,
  nextProposalId: 0,
});
