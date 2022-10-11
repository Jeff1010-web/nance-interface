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

export interface SnapshotVotingPower {
    vp: number;
    vp_by_strategy: number[];
    vp_state: string;
}

export default function useVotingPower(voter: string, space: string, proposal: string): {data: number, loading: boolean} {
    console.debug("🔧 useVotingPower.args ->", {voter, space, proposal});

    const { loading, data, error } = useQuery<{ vp: SnapshotVotingPower}>(QUERY, {
        skip: !voter || !space || !proposal,
        variables: {
            voter: voter,
            space: space,
            proposal: proposal
        }
    });

    if (error) {
        console.warn("🚨 useVotingPower.error ->", {voter, space, proposal}, {error});
        return {data: 0, loading: false};
    }

    const vp = data?.vp?.vp;
    console.debug("🔧 useVotingPower.return ->", {data, loading});
    return { data: vp, loading };
}