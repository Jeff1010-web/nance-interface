import { APIError, useQuery } from "graphql-hooks";
import { ProposalType } from "@snapshot-labs/snapshot.js/dist/sign/types";
import { Signer, Wallet } from "ethers";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { useEthersSigner } from "../ViemAdapter";
import { SNAPSHOT_HUB, SNAPSHOT_HEADERS } from "@/constants/Snapshot";
import { ALL_VOTES_OF_USER } from "./queries/Vote";
import { AllVotes } from "@/models/SnapshotTypes";

export default function useVote(
  space: string, 
  proposal: string, 
  type: string, 
  choice: string | number | number[] | {
        [key: string]: number;
    }, 
  reason: string = ""
){
  // state
  const [value, setValue] = useState<unknown>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(undefined);
  // external state
  const signer = useEthersSigner();
  const { address, isConnected } = useAccount();

  const trigger = useCallback(async () => {
    try {
      const client = await import("@snapshot-labs/snapshot.js").then((snapshot) => new snapshot.default.Client712(SNAPSHOT_HUB));
      setError(undefined);
      setLoading(true);
      const receipt = await client.vote(
                signer as Signer as Wallet, 
                address as any, 
                {
                  space,
                  proposal,
                  type: type as ProposalType,
                  choice: choice as number | number[] | string,
                  reason,
                  app: "jbdao.org"
                }
      );
      setValue(receipt);
    } catch(err: any) {
      console.warn("🚨 useVote.trigger.error ->", err);
      setError(err);
      setValue(undefined);
    } finally {
      setLoading(false);
    }
        
  }, [signer, space, proposal, type, choice, reason, address]);

  const reset = () => {
    setValue(undefined);
    setError(undefined);
    setLoading(false);
  };
    
  return { trigger, value, loading, error, reset };
}

export function useAllVotesOfAddress(
  address: string,
  limit: number,
  spaceFilter: string = "",
): {
  loading: boolean;
  error: APIError<object> | undefined;
  data: AllVotes;
} {
  // Load voted proposals
  const { loading, data, error, cacheHit } = useQuery<{
    votes: { id: string; choice: any; proposal: { type: string } }[];
  }>(ALL_VOTES_OF_USER, {
    variables: {
      voter: address,
      first: Math.min(limit, 1000),
      space: spaceFilter,
    },
    skip: !(address && address.length == 42),
  });
  console.debug("🔧 useAllVotesOfAddress.cacheHit", cacheHit);

  const optionCount: { [key: number]: number } = [];
  data?.votes
    ?.filter((v) => v.proposal.type === "basic")
    .forEach((v) => optionCount[v.choice]++);

  return {
    loading,
    error,
    data: {
      total: data?.votes.length ?? 0,
      for: optionCount[1],
      against: optionCount[2],
      abstain: optionCount[3],
    },
  };
}

export async function fetchAllVotesOfAddress(
  address: string,
  limit: number,
  spaceFilter: string = "",
): Promise<AllVotes> {
  const ret = await fetch(`${SNAPSHOT_HUB}/graphql`, {
    method: "POST",
    headers: SNAPSHOT_HEADERS,
    body: JSON.stringify({
      query: ALL_VOTES_OF_USER,
      variables: {
        voter: address,
        first: Math.min(limit, 1000),
        space: spaceFilter,
      },
    }),
  }).then((res) => res.json());

  if (ret.errors) {
    console.warn("fetchAllVotesOfAddress errors occurred: ", ret.errors);
    return {
      total: 0,
      for: 0,
      against: 0,
      abstain: 0,
    };
  }

  const votes: {
    id: string;
    choice: any;
    proposal: {
      type: string;
    };
  }[] = ret.data?.votes;
  const optionCount = [0, 0, 0, 0];
  votes
    .filter((v) => v.proposal.type === "basic")
    .forEach((v) => optionCount[v.choice]++);

  return {
    total: votes.length,
    for: optionCount[1],
    against: optionCount[2],
    abstain: optionCount[3],
  };
}
