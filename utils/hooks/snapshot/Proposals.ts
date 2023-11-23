import { APIError, useQuery } from "graphql-hooks";
import { mapChoiceIndex } from "@/utils/functions/snapshotUtil";
import { PROPOSALS_BY_ID_QUERY, PROPOSALS_QUERY } from "./queries/Proposal";
import { VOTED_PROPOSALS_QUERY, VOTES_OF_PROPOSAL_QUERY } from "./queries/Vote";
import {
  SnapshotProposal,
  SnapshotVote,
  SnapshotVotedData,
  SnapshotSpaceWithVotesCount,
} from "@/models/SnapshotTypes";

export function useProposalsByID(
  proposalIds: string[],
  address: string,
  skip: boolean = false,
) {
  const ret = useProposalsWithCustomQuery(
    PROPOSALS_BY_ID_QUERY,
    {
      first: proposalIds.length,
      proposalIds,
    },
    address,
    skip,
  );

  if (address?.length !== 42) {
    console.debug("skip");
  } else {
    console.debug("useProposalsByID", {
      proposalIds,
      address,
      skip,
      loading: ret.loading,
      data: ret.data,
    });
  }

  return ret;
}

export function useProposalsWithFilter(
  space: string,
  active: boolean,
  keyword: string,
  address: string,
  first: number,
  skip: number,
) {
  return useProposalsWithCustomQuery(
    PROPOSALS_QUERY,
    {
      space: space,
      state: active ? "active" : "",
      keyword: keyword,
      first: first,
      skip: skip,
    },
    address,
  );
}

export function useProposalsWithCustomQuery(
  query: string,
  variables: object,
  address: string,
  skip: boolean = false,
): {
  loading: boolean;
  error: APIError<object> | undefined;
  data: {
    proposalsData: SnapshotProposal[] | undefined;
    votedData: { [id: string]: SnapshotVotedData };
  };
  refetch: (options?: any) => void;
} {
  // console.debug("🔧 useProposalsWithCustomQuery.args ->", { query, variables, skip });

  // Load proposals
  const {
    loading: proposalsLoading,
    data: proposalsData,
    error: proposalsError,
    cacheHit,
  } = useQuery<{ proposals: SnapshotProposal[] }>(query, { variables, skip });
  // Load voted proposals
  const {
    loading: votedLoading,
    data: votedRawData,
    error: votedError,
    refetch,
  } = useQuery<{ votes: SnapshotVotedData[] }>(VOTED_PROPOSALS_QUERY, {
    variables: {
      voter: address,
      proposalIds: proposalsData?.proposals.map((proposal) => proposal.id),
      first: Math.min(proposalsData?.proposals.length || 0, 1000),
    },
    skip: skip || address.length !== 42, // address not ready, don't run this query yet
  });
  // console.debug("🔧 useProposalsWithCustomQuery.cacheHit", cacheHit);

  // Find voted proposals
  let votedData: { [id: string]: SnapshotVotedData } = {};
  if (address) {
    votedRawData?.votes.forEach((vote) => {
      votedData[vote.proposal.id] = {
        ...vote,
        choice: mapChoiceIndex(
          vote.proposal.type,
          vote.proposal.choices,
          vote.choice,
        ),
      };
    });
  }

  const ret = {
    data: {
      proposalsData: proposalsData?.proposals,
      votedData,
    },
    // FIXME: this is a hack to get around the flashing issue, need to find a better way
    loading: proposalsLoading && votedLoading,
    error: proposalsError || votedError,
    refetch,
  };
  // console.debug("🔧 useProposalsWithCustomQuery.return ->", { ret });
  return ret;
}

export function useVotesOfAddress(
  address: string,
  skip: number,
  limit: number,
  spaceFilter: string = "",
): {
  loading: boolean;
  error: APIError<object> | undefined;
  data: {
    votedData: SnapshotVotedData[];
    spaces: SnapshotSpaceWithVotesCount[];
  };
} {
  //console.debug("🔧 useProposalsWithCustomQuery.args ->", {query, variables});

  // Load voted proposals
  const variables: { [key: string]: any } = {
    voter: address,
    first: Math.min(limit, 1000),
    skip,
  };
  if (spaceFilter) {
    variables["space"] = spaceFilter;
  }
  const {
    loading: votedLoading,
    data: votedRawData,
    error: votedError,
  } = useQuery<{ votes: SnapshotVotedData[] }>(VOTED_PROPOSALS_QUERY, {
    variables,
    skip: address.length !== 42,
  });

  // Map choices from index to option label
  let votedData: SnapshotVotedData[] = [];
  let spaces: { [id: string]: SnapshotSpaceWithVotesCount } = {};
  if (address) {
    votedData =
      votedRawData?.votes?.map((vote) => {
        if (!spaces[vote.space.id]) {
          spaces[vote.space.id] = {
            id: vote.space.id,
            name: vote.space.name,
            votes: 0,
          };
        }
        spaces[vote.space.id].votes++;

        return {
          ...vote,
          choice: mapChoiceIndex(
            vote.proposal.type,
            vote.proposal.choices,
            vote.choice,
          ),
        };
      }) || [];
  }

  const ret = {
    data: {
      votedData,
      spaces: Object.values(spaces).sort((a, b) => b.votes - a.votes),
    },
    loading: votedLoading,
    error: votedError,
  };
  console.debug("🔧 useVotesOfAddress.return ->", { ret });
  return ret;
}

export const VOTES_PER_PAGE = 150;

export function useProposalVotes(
  proposal: SnapshotProposal | undefined,
  skip: number,
  orderBy: "created" | "vp" = "created",
  withField: "" | "reason" | "app",
  skipThisHook: boolean = false,
  overrideLimit: number = 0,
): {
  loading: boolean;
  error: APIError<object> | undefined;
  data: {
    votesData: SnapshotVote[];
    totalVotes: number;
  };
  refetch: (options?: any) => void;
} {
  // sort after query if need reason
  const sortAfterQuery = withField === "reason" || withField === "app";
  console.debug("🔧 useProposalVotes.args ->", {
    proposalId: proposal?.id,
    skip,
    orderBy,
    withField,
  });

  // Load related votes
  const {
    loading: voteLoading,
    data: voteData,
    error: voteError,
    refetch,
    cacheHit,
  } = useQuery<{ votes: SnapshotVote[] }>(VOTES_OF_PROPOSAL_QUERY, {
    variables: {
      // Snapshot API Limit: The `first` argument must not be greater than 1000
      first: sortAfterQuery
        ? Math.min(proposal?.votes ?? 0, 1000)
        : overrideLimit === 0
          ? VOTES_PER_PAGE
          : Math.min(overrideLimit, 1000),
      skip: sortAfterQuery ? 0 : skip,
      orderBy: orderBy,
      id: proposal?.id ?? "",
    },
    skip: skipThisHook,
  });
  console.debug("🔧 useProposalVotes.cacheHit", cacheHit);

  let totalVotes = proposal?.votes || 0;
  let votes = voteData?.votes || [];

  if (sortAfterQuery) {
    const allVotes =
      voteData?.votes?.filter((vote) => {
        if (withField === "reason") {
          return vote.reason && vote.reason !== "";
        } else if (withField === "app") {
          return vote.app && vote.app !== "" && vote.app !== "snapshot";
        } else {
          return true;
        }
      }) || [];
    totalVotes = allVotes?.length || 0;
    votes = allVotes
      ?.sort((a, b) => {
        if (orderBy === "created") {
          return b.created - a.created;
        } else {
          return b.vp - a.vp;
        }
      })
      .slice(skip, skip + VOTES_PER_PAGE);
  }

  let votesData: SnapshotVote[] = votes?.map((vote) => {
    return {
      ...vote,
      choice: mapChoiceIndex(proposal?.type, proposal?.choices, vote?.choice),
    };
  });

  const ret = {
    data: {
      votesData,
      totalVotes,
    },
    loading: voteLoading,
    error: voteError,
    refetch,
  };
  console.debug("🔧 useProposalVotes.return ->", { ret });
  return ret;
}
