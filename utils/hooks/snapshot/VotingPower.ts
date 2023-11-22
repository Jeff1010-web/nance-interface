import { useQuery } from "graphql-hooks";
import { SNAPSHOT_HEADERS, SNAPSHOT_HUB } from "@/constants/Snapshot";
import { VOTING_POWER_QUERY } from "./queries/Vote";

export interface SnapshotVotingPower {
  vp: number;
  vp_by_strategy: number[];
  vp_state: string;
}

export default function useVotingPower(voter: string | undefined, space: string | undefined, proposal: string | undefined): { data: number, loading: boolean } {
  const { loading, data, error } = useQuery<{ vp: SnapshotVotingPower }>(VOTING_POWER_QUERY, {
    skip: !voter || !space || !proposal,
    variables: { voter, space, proposal }
  });

  if (error) {
    console.warn("🚨 useVotingPower.error ->", { voter, space, proposal }, { error });
    return { data: 0, loading: false };
  }

  const vp = data?.vp?.vp;
  return { data: vp ?? 0, loading };
}

export async function fetchVotingPower(voter: string, space: string, proposal: string): Promise<SnapshotVotingPower> {
  const ret = await fetch(`${SNAPSHOT_HUB}/graphql`, {
    method: "POST",
    headers: SNAPSHOT_HEADERS,
    body: JSON.stringify({
      query: VOTING_POWER_QUERY,
      variables: { voter, space, proposal }
    }),
  }).then(res => res.json());
  
  if(ret.errors) {
    console.warn("fetchVotingPower errors occurred: ", ret.errors);
    return {
      vp: 0,
      vp_by_strategy: [],
      vp_state: "error"
    };
  } else {
    return ret.data.vp;
  }
}
