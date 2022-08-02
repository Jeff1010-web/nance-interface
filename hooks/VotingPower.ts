import { useQuery } from 'graphql-hooks'

const QUERY = `
query VotingPowerQuery($voter: String!, $space: String, $proposal: String) {
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
    const { loading, data } = useQuery(QUERY, {
        variables: {
            voter: voter,
            space: space,
            proposal: proposal
        }
    });
    const vp = data?.vp?.vp;
    return { data: vp, loading };
}