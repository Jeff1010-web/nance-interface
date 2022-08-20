import { useQuery } from 'graphql-hooks'

const SPACES_QUERY = `
query Spaces($address: String) {
    follows(
        first: 10,
        where: {
            follower: $address
        }
    ) {
        space {
            id
        }
        created
    }
}
`

const ACTIVE_PROPOSALS_QUERY = `
query Proposals($spaceIds: [String]) {
    proposals(
      first: 10
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

interface FollowedSpacesData {
    id: string,
    status: boolean
}

export default function useFollowedSpaces(address: string): {data: FollowedSpacesData[], loading: boolean} {
    // Load spaces
    const { loading: spacesLoading, data: spacesData } = useQuery(SPACES_QUERY, {
        variables: {
            address: address
        }
    });
    const spaceMap = spacesData?.follows.reduce((acc, follow) => {
        acc[follow.space.id] = 0;
        return acc;
    }, {}) || {};
    // Load related active proposals
    const { loading: proposalsLoading, data: proposalsData } = useQuery(ACTIVE_PROPOSALS_QUERY, {
        variables: {
            spaceIds: Object.keys(spaceMap)
        }
    });
    console.info("📗 useFollowedSpaces ->", {address, spaceMap}, {spacesData, proposalsData});

    // Calculate count of active proposals in each space
    // { space: 3 }
    const activeProposalCounts = proposalsData?.proposals.reduce((acc, proposal) => {
        acc[proposal.space.id]++;
        return acc;
    }, spaceMap);
    const ret = activeProposalCounts ? Object.entries(activeProposalCounts).map(([id, count]) => ({id, status: count > 0})) : [];

    return { loading: spacesLoading || proposalsLoading, data: ret };
}