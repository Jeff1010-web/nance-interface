import { APIError, useQuery } from 'graphql-hooks'
import { mapChoiceIndex } from '../../libs/snapshotUtil'

const PROPOSALS_QUERY = `
query Proposals($first: Int, $space: String, $state: String, $keyword: String) {
  proposals(
    first: $first
    skip: 0
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
query VotesBySingleProposalId($id: String, $skip: Int, $orderBy: String) {
  votes (
    first: 10
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
query VotedProposals($first: Int, $voter: String, $proposalIds: [String]) {
  votes (
    first: $first
    where: {
      voter: $voter,
      proposal_in: $proposalIds
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
      type
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
  }
}, 'voter'>;

export function useProposalsWithFilter(space: string, active: boolean, keyword: string, address: string, first: number): {
  loading: boolean,
  error: APIError<object>,
  data: {
    proposalsData: SnapshotProposal[], 
    votedData: { [id: string]: SnapshotVotedData}
  }
} {

  console.debug("🔧 useProposalsWithFilter.args ->", {space,active,keyword,address,first});

  // Load proposals
  const {
    loading: proposalsLoading,
    data: proposalsData,
    error: proposalsError
  } = useQuery<{ proposals: SnapshotProposal[] }>(PROPOSALS_QUERY, {
    variables: {
      space: space,
      state: active ? "active" : "",
      keyword: keyword,
      first: first
    }
  });
  // Load voted proposals
  const {
    loading: votedLoading,
    data: votedRawData,
    error: votedError
  } = useQuery<{ votes: SnapshotVotedData[] }>(VOTED_PROPOSALS_QUERY, {
    variables: {
      voter: address,
      proposalIds: proposalsData?.proposals.map(proposal => proposal.id),
      first: proposalsData?.proposals.length || 0
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
  console.debug("🔧 useProposalsWithFilter.return ->", {ret});
  return ret;
}

export function useProposalExtendedOf(proposalId: string, address: string, skip: number, orderBy: 'created' | 'vp' = 'created'): {
  loading: boolean,
  error: APIError<object>,
  data: {
    proposalData: SnapshotProposal, 
    votedData: SnapshotVotedData, 
    votesData: SnapshotVote[]}
} {

  console.debug("🔧 useProposalExtendedOf.args ->", {proposalId, address, skip, orderBy});

  // Load proposals
  const {
    loading: proposalLoading,
    data: proposalData,
    error: proposalError
  } = useQuery<{ proposal: SnapshotProposal }>(SINGLE_PROPOSAL_QUERY, {
    variables: {
      id: proposalId
    }
  });
  // Load related votes
  const {
    loading: voteLoading,
    data: voteData,
    error: voteError
  } = useQuery<{ votes: SnapshotVote[] }>(VOTES_OF_PROPOSAL_QUERY, {
    variables: {
      skip: skip,
      orderBy: orderBy,
      id: proposalId
    }
  });
  // Load voted proposals
  const {
    loading: votedLoading,
    data: votedRawData,
    error: votedError
  } = useQuery<{ votes: SnapshotVotedData[] }>(VOTED_PROPOSALS_QUERY, {
    variables: {
      voter: address,
      proposalIds: [proposalId],
      first: 1
    }
  });

  const votesData: SnapshotVote[] = voteData?.votes.map(vote => {
    return {
      ...vote,
      choice: mapChoiceIndex(proposalData?.proposal.type, proposalData?.proposal.choices, vote.choice)
    }
  })

  // Find voted proposals
  // FIXME use separate graph ql to get voted data
  let votedData: SnapshotVotedData;
  if (address) {
    const vote = votedRawData?.votes[0];
    if (vote) {
      votedData = {
        ...vote,
        choice: mapChoiceIndex(proposalData?.proposal.type, proposalData?.proposal.choices, vote.choice)
      }
    }
  }

  const ret = { 
    data: {
      proposalData: {
        ...proposalData?.proposal
      },
      votedData,
      votesData
    }, 
    loading: proposalLoading || voteLoading, 
    error: proposalError || voteError 
  };
  console.debug("🔧 useProposalExtendedOf.return ->", {ret});
  return ret;
}