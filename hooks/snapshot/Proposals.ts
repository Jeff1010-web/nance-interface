import { APIError, useQuery } from 'graphql-hooks'
import { mapChoiceIndex } from '../../libs/snapshotUtil'

const PROPOSALS_QUERY = `
query Proposals($first: Int, $skip: Int, $space: String, $state: String, $keyword: String) {
  proposals(
    first: $first
    skip: $skip
    where: {
      space: $space,
      state: $state,
      title_contains: $keyword
    }
    orderBy: "created",
    orderDirection: desc
  ) {
    id,
    author,
    title,
    body,
    type,
    state,
    created,
    start,
    end,
    choices,
    scores,
    votes,
    quorum,
    scores_total
  }
}
`

const PROPOSALS_BY_ID_QUERY = `
query ProposalsByID($first: Int, $proposalIds: [String]) {
  proposals(
    first: $first
    skip: 0
    where: {
      id_in: $proposalIds
    }
    orderBy: "created",
    orderDirection: desc
  ) {
    id,
    author,
    title,
    body,
    type,
    state,
    created,
    start,
    end,
    choices,
    scores,
    votes,
    quorum,
    scores_total
  }
}
`

const SINGLE_PROPOSAL_QUERY = `
query Proposals($id: String) {
  proposal(id: $id) {
    id,
    author,
    title,
    body,
    type,
    state,
    created,
    start,
    end,
    choices,
    scores
    votes,
    quorum,
    scores_total
  }
}
`

const VOTES_OF_PROPOSAL_QUERY = `
query VotesBySingleProposalId($id: String, $skip: Int, $orderBy: String, $first: Int) {
  votes (
    first: $first
    skip: $skip
    where: {
      proposal: $id
    }
    orderBy: $orderBy,
    orderDirection: desc
  ) {
    id
    app
    created
    voter
    choice
    vp
    reason
  }
}
`

const VOTED_PROPOSALS_QUERY = `
query VotedProposals($first: Int, $skip: Int, $voter: String, $proposalIds: [String], $space: String) {
  votes (
    first: $first,
    skip: $skip,
    where: {
      voter: $voter,
      proposal_in: $proposalIds,
      space: $space
    }
    orderBy: "created",
    orderDirection: desc
  ) {
    id,
    app,
    created,
    choice,
    vp,
    reason,
    proposal {
      id,
      choices,
      type,
      title
    },
    space {
      id,
      name
    }
  }
}
`

// Model for a single proposal
export interface SnapshotProposal {
  id: string;
  // content
  author: string;
  title: string;
  body: string;
  // metadata
  type: string;
  state: string;
  created: number;
  start: number;
  end: number;
  // voting
  choices: string[];
  scores: number[];
  votes: number;
  quorum: number;
  scores_total: number;
}

// Model for a single vote
export interface SnapshotVote {
  id: string;
  // metadata
  app: string;
  created: number;
  // voting
  voter: string;
  choice: any;
  vp: number;
  reason: string;
}

export type SnapshotVotedData = Omit<SnapshotVote & {
  proposal: {
    id: string;
    choices: string[];
    type: string;
    title: string;
  },
  space: {
    id: string;
    name: string;
  }
}, 'voter'>;

export async function fetchProposalInfo(proposalId: string): Promise<SnapshotProposal> {
  return fetch('https://hub.snapshot.org/graphql', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      query: SINGLE_PROPOSAL_QUERY, 
      variables: { id: proposalId } 
    }),
  }).then(res => res.json()).then(json => json.data.proposal)
}

export function useProposalsByID(proposalIds: string[], address: string) {
  return useProposalsWithCustomQuery(PROPOSALS_BY_ID_QUERY, {
    first: proposalIds.length,
    proposalIds
  }, address);
}

export function useProposalsWithFilter(space: string, active: boolean, keyword: string, address: string, first: number, skip: number) {
  return useProposalsWithCustomQuery(PROPOSALS_QUERY, {
    space: space,
    state: active ? "active" : "",
    keyword: keyword,
    first: first,
    skip: skip
  }, address);
}

export function useProposalsWithCustomQuery(query: string, variables: object, address: string): {
  loading: boolean,
  error: APIError<object>,
  data: {
    proposalsData: SnapshotProposal[], 
    votedData: { [id: string]: SnapshotVotedData}
  }
} {

  console.debug("🔧 useProposalsWithCustomQuery.args ->", {query, variables});

  // Load proposals
  const {
    loading: proposalsLoading,
    data: proposalsData,
    error: proposalsError
  } = useQuery<{ proposals: SnapshotProposal[] }>(query, { variables });
  // Load voted proposals
  const {
    loading: votedLoading,
    data: votedRawData,
    error: votedError
  } = useQuery<{ votes: SnapshotVotedData[] }>(VOTED_PROPOSALS_QUERY, {
    variables: {
      voter: address,
      proposalIds: proposalsData?.proposals.map(proposal => proposal.id),
      first: Math.min(proposalsData?.proposals.length || 0, 1000)
    }
  });

  // Find voted proposals
  let votedData: { [id: string]: SnapshotVotedData} = {};
  if (address) {
    votedRawData?.votes.forEach(vote => {
      votedData[vote.proposal.id] = {
        ...vote,
        choice: mapChoiceIndex(vote.proposal.type, vote.proposal.choices, vote.choice)
      }
    });
  }

  const ret = { 
    data: {
      proposalsData: proposalsData?.proposals, 
      votedData
    }, 
    loading: proposalsLoading || votedLoading, 
    error: proposalsError || votedError 
  };
  console.debug("🔧 useProposalsWithCustomQuery.return ->", {ret});
  return ret;
}

export interface SnapshotSpaceWithVotesCount {
  id: string;
  name: string;
  votes: number;
}

export function useVotesOfAddress(address: string, skip: number, limit: number, spaceFilter: string = ""): {
  loading: boolean,
  error: APIError<object>,
  data: {
    votedData: SnapshotVotedData[],
    spaces: SnapshotSpaceWithVotesCount[]
  }
} {

  //console.debug("🔧 useProposalsWithCustomQuery.args ->", {query, variables});

  // Load voted proposals
  const {
    loading: votedLoading,
    data: votedRawData,
    error: votedError
  } = useQuery<{ votes: SnapshotVotedData[] }>(VOTED_PROPOSALS_QUERY, {
    variables: {
      voter: address,
      first: Math.min(limit, 1000),
      skip,
      space: spaceFilter
    },
    skip: !(address && address.length == 42)
  });

  // Map choices from index to option label
  let votedData: SnapshotVotedData[] = [];
  let spaces: { [id: string]: SnapshotSpaceWithVotesCount } = {};
  if (address) {
    votedData = votedRawData?.votes.map(vote => {
      if(!spaces[vote.space.id]) {
        spaces[vote.space.id] = {
          id: vote.space.id,
          name: vote.space.name,
          votes: 0
        }
      }
      spaces[vote.space.id].votes++;

      return {
        ...vote,
        choice: mapChoiceIndex(vote.proposal.type, vote.proposal.choices, vote.choice)
      }
    });
  }

  const ret = { 
    data: {
      votedData, spaces: Object.values(spaces).sort((a, b) => b.votes - a.votes)
    }, 
    loading: votedLoading, 
    error: votedError 
  };
  console.debug("🔧 useVotesOfAddress.return ->", {ret});
  return ret;
}

export const VOTES_PER_PAGE = 15;

export function useProposalVotes(proposal: SnapshotProposal, skip: number, orderBy: 'created' | 'vp' = 'created', withField: "" | "reason" | "app", skipThisHook: boolean = false, overrideLimit: number = 0): {
  loading: boolean,
  error: APIError<object>,
  data: {
    votesData: SnapshotVote[],
    totalVotes: number
  }
} {
  
  // sort after query if need reason
  const sortAfterQuery = withField === "reason" || withField === "app";
  console.debug("🔧 useProposalVotes.args ->", {proposalId: proposal.id, skip, orderBy, withField});

  // Load related votes
  const {
    loading: voteLoading,
    data: voteData,
    error: voteError
  } = useQuery<{ votes: SnapshotVote[] }>(VOTES_OF_PROPOSAL_QUERY, {
    variables: {
      // Snapshot API Limit: The `first` argument must not be greater than 1000
      first: sortAfterQuery ? Math.min(proposal.votes, 1000) : (overrideLimit === 0 ? VOTES_PER_PAGE : Math.min(overrideLimit, 1000)),
      skip: sortAfterQuery ? 0 : skip,
      orderBy: orderBy,
      id: proposal.id
    }, 
    skip: skipThisHook
  });

  let totalVotes = proposal?.votes || 0;
  let votes = voteData?.votes || [];

  if(sortAfterQuery) {
    const allVotes = voteData?.votes
      .filter((vote) => {
        if(withField === "reason") {
          return vote.reason && vote.reason !== "";
        } else if(withField === "app") {
          return vote.app && vote.app !== "" && vote.app !== "snapshot";
        } else {
          return true;
        }
      });
    totalVotes = allVotes?.length || 0;
    votes = allVotes?.sort((a, b) => {
      if (orderBy === 'created') {
        return b.created - a.created;
      } else {
        return b.vp - a.vp;
      }
    }).slice(skip, skip + VOTES_PER_PAGE);
  }

  let votesData: SnapshotVote[] = votes?.map(vote => {
    return {
      ...vote,
      choice: mapChoiceIndex(proposal.type, proposal.choices, vote.choice)
    }
  })

  const ret = { 
    data: {
      votesData,
      totalVotes
    }, 
    loading: voteLoading, 
    error: voteError 
  };
  console.debug("🔧 useProposalVotes.return ->", {ret});
  return ret;
}