import { useQuery } from "graphql-hooks";


const QUERY = `
query ProposalsOverview($first: Int, $space: String, $address: String) {
    proposals(
      first: $first
      skip: 0
      where: {
        space: $space
      }
      orderBy: "created",
      orderDirection: desc
    ) {
      id,
      state,
      quorum,
      scores_total
    }
    
    votes (
      first: $first
      skip: 0
      where: {
        space: $space
        voter: $address
      }
      orderBy: "created",
      orderDirection: desc
    ) {
      id
      proposal {
        id
      }
    }
}
`

interface ProposalOverviewQueryModel {
    proposals: {
        id: string
        state: string
        quorum: number,
        scores_total: number
    }[],
    votes: {
        id: string
        proposal: {
            id: string
        }
    }[]
}

export interface SnapshotProposalsOverview {
    [id: string]: {
        // active closed pending
        state: string;
        // under quorum?
        scores_total: number;
        quorum: number;
        // voted?
        voted: boolean;
    }
}

export function useProposalsOverview(space: string, first: number, address: string) {

    console.debug("🔧 useProposalsOverview.args ->", {space, first, address});
    const { loading, error, data } = useQuery<ProposalOverviewQueryModel>(QUERY, {
        skip: !space || !first,
        variables: { first, space, address }
    })

    const ret: SnapshotProposalsOverview = {}
    data?.proposals.forEach(p => {
        ret[p.id] = {
            state: p.state,
            quorum: p.quorum,
            scores_total: p.scores_total,
            voted: false
        }
    })
    if (address) {
        data?.votes.forEach(v => {
            const pid = v.proposal.id
            ret[pid].voted = true
        })
    }

    console.debug("🔧 useProposalsOverview.return ->", {ret});
    return { loading, error, data: ret }
  }