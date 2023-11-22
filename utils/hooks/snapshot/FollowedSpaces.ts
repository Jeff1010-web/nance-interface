import { useQuery } from "graphql-hooks";
import { ACTIVE_PROPOSALS_QUERY } from "./queries/Proposal";
import { SPACES_QUERY } from "./queries/Space";
import { FollowedSpacesData } from "@/models/SnapshotTypes";

export default function useFollowedSpaces(address: string): {data: FollowedSpacesData[], loading: boolean} {
  // Load spaces
  const { loading: spacesLoading, data: spacesData } = useQuery(SPACES_QUERY, {
    variables: {
      address: address
    }
  });
  const spaceMap: { [id: string]: {name: string, activeProposals: number} } = 
        spacesData?.follows.reduce((
          acc: { [id: string]: {name: string, activeProposals: number} }, 
          follow: { space: { id: string; name: string; }, created: number }) => {
          acc[follow.space.id] = {
            name: follow.space.name,
            activeProposals: 0
          };
          return acc;
        }, {}) || {};
    // Load related active proposals
  const { loading: proposalsLoading, data: proposalsData } = useQuery(ACTIVE_PROPOSALS_QUERY, {
    variables: {
      spaceIds: Object.keys(spaceMap)
    }
  });

  // Calculate count of active proposals in each space
  // { space: 3 }
  const activeProposalCounts: { [id: string]: {name: string, activeProposals: number} } = 
        proposalsData?.proposals.reduce((
          acc: { [id: string]: {name: string, activeProposals: number} }, 
          proposal: { space: {id: string}, id: string }) => {
          acc[proposal.space.id] && acc[proposal.space.id].activeProposals++;
          return acc;
        }, spaceMap);
  const ret = activeProposalCounts ? Object.entries(activeProposalCounts).map(([id, entry]) => ({id, name: entry.name, activeProposals: entry.activeProposals})) : [];
  ret.sort((a, b) => {
    if (a.activeProposals > b.activeProposals) {
      return -1;
    }
    if (a.activeProposals < b.activeProposals) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });

  return { loading: spacesLoading || proposalsLoading, data: ret };
}