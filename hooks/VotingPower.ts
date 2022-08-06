import { useQuery } from 'graphql-hooks'

const QUERY = `
query VotingPowerQuery($voter: String!, $space: String!, $proposal: String) {
    vp (
      voter: $voter
      space: $space
      proposal: $proposal
    ) {
      vp
      vp_by_strategy
      vp_state
    }
}
`

export default function useVotingPower(voter: string, space: string, proposal: string): {data: number, loading: boolean} {
    const { loading, data, error } = useQuery(QUERY, {
        variables: {
            voter: voter,
            space: space,
            proposal: proposal
        }
    });

    if (error) {
        console.error("🔴 useVotingPower ->", {voter, space, proposal}, {error});
        return {data: 0, loading: false};
    }

    const vp = data?.vp?.vp;
    return { data: vp, loading };
}