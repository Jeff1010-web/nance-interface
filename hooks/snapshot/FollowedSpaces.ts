import { useQuery } from 'graphql-hooks'

const SPACES_QUERY = `
query Spaces($address: String) {
    follows(
        first: 25,
        where: {
            follower: $address
        }
    ) {
        space {
            id
            name
        }
        created
    }
}
`

const ACTIVE_PROPOSALS_QUERY = `
query Proposals($spaceIds: [String]) {
    proposals(
      first: 250
      skip: 0
      where: {
        space_in: $spaceIds,
        state: "active"
      }
      orderBy: "created",
      orderDirection: desc
    ) {
      space {
        id
      }
      id
    }
  }
`

export interface FollowedSpacesData {
    id: string,
    name: string,
    activeProposals: number
}

export default function useFollowedSpaces(address: string): {data: FollowedSpacesData[], loading: boolean} {
    // Load spaces
    const { loading: spacesLoading, data: spacesData } = useQuery(SPACES_QUERY, {
        variables: {
            address: address
        }
    });
    const spaceMap: { [id: string]: {name: string, activeProposals: number} } = spacesData?.follows.reduce((acc, follow) => {
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
    const activeProposalCounts: { [id: string]: {name: string, activeProposals: number} } = proposalsData?.proposals.reduce((acc, proposal) => {
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
    })
    console.info("📗 useFollowedSpaces ->", {address, spaceMap}, {spacesData, proposalsData, ret});

    return { loading: spacesLoading || proposalsLoading, data: ret };
}