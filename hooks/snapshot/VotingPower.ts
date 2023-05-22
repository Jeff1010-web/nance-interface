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

export default function useVotingPower(voter: string, space: string, proposal: string): { data: number, loading: boolean } {
  const { loading, data, error } = useQuery<{ vp: SnapshotVotingPower }>(QUERY, {
    skip: !voter || !space || !proposal,
    variables: { voter, space, proposal }
  });

  if (error) {
    console.warn("🚨 useVotingPower.error ->", { voter, space, proposal }, { error });
    return { data: 0, loading: false };
  }

  const vp = data?.vp?.vp;
  return { data: vp, loading };
}

export async function fetchVotingPower(voter: string, space: string, proposal: string): Promise<SnapshotVotingPower> {
  const ret = await fetch('https://hub.snapshot.org/graphql', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { voter, space, proposal }
    }),
  }).then(res => res.json())
  
  if(ret.errors) {
    return {
      vp: 0,
      vp_by_strategy: [],
      vp_state: "error"
    }
  } else {
    return ret.data.vp;
  }
}
