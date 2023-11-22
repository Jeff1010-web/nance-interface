import { useQuery } from "graphql-hooks";
import { PROPOSALS_OVERVIEW_QUERY } from "./queries/Proposal";
import { ProposalOverviewQueryModel, SnapshotProposalsOverview } from "@/models/SnapshotTypes";

export function useProposalsOverview(space: string, first: number, address: string) {

  console.debug("🔧 useProposalsOverview.args ->", {space, first, address});
  const { loading, error, data } = useQuery<ProposalOverviewQueryModel>(PROPOSALS_OVERVIEW_QUERY, {
    skip: !space || !first,
    variables: { first, space, address }
  });

  const ret: SnapshotProposalsOverview = {};
  data?.proposals.forEach(p => {
    ret[p.id] = {
      state: p.state,
      quorum: p.quorum,
      scores_total: p.scores_total,
      voted: false
    };
  });
  if (address) {
    data?.votes.forEach(v => {
      const pid = v.proposal.id;
      ret[pid].voted = true;
    });
  }

  console.debug("🔧 useProposalsOverview.return ->", {ret});
  return { loading, error, data: ret };
}