import { APIError, useQuery } from 'graphql-hooks'

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
    title,
    state,
    start,
    end,
    choices,
    scores,
    votes,
    quorum,
    scores_total,
    body
  }
}
`

const PROPOSAL_QUERY = `
query Proposals($id: String) {
  proposal(id: $id) {
    id,
    title,
    state,
    created,
    start,
    end,
    choices,
    scores
    votes,
    quorum,
    scores_total,
    body,
    author
  }
}
`

const VOTES_BY_PROPOSALID_QUERY = `
query VotesByProposalId($first: Int, $space: String, $proposalIds: [String]) {
  votes (
    first: $first
    where: {
      space: $space,
      proposal_in: $proposalIds
    }
    orderBy: "created",
    orderDirection: desc
  ) {
    voter
    vp
    proposal {
      id
      choices
    }
    choice
  }
}
`

const VOTES_BY_SINGLE_PROPOSALID_QUERY = `
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
    voter
    vp
    choice
    reason
    created
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
    proposal {
      id,
      choices
    },
    choice
    reason
    vp
    created
  }
}
`

export interface ProposalDataExtended {
  id: string
  title: string
  start: number
  state: string
  end: number
  choices: string[]
  scores: number[]
  votes: number
  quorum: number
  scores_total: number
  body: string
  author?: string
  created?: number
}

export interface VoteData {
  choice: string
  score: number
  created: number
  reason: string
  voter?: string
  id?: string
  app?: string
}

export interface VotesData {
  [id: string]: VoteData
}

export function useProposalsExtendedOf(space: string, active: boolean, keyword: string, address: string, first: number): {
  loading: boolean,
  error: APIError<object>,
  data: {proposalsData: ProposalDataExtended[], votedData: VotesData}
} {

  console.info("📗 useProposalsExtendedOf ->", {space,active,keyword,address,first});
  // Load proposals
  const {
    loading: proposalLoading,
    data: proposalData,
    error: proposalError
  } = useQuery(PROPOSALS_QUERY, {
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
  } = useQuery(VOTED_PROPOSALS_QUERY, {
    variables: {
      voter: address,
      proposalIds: proposalData?.proposals.map(proposal => proposal.id),
      first: proposalData?.proposals.length || 0
    }
  });

  const loading = proposalLoading || votedLoading;
  // Find voted proposals
  let votedData = {};
  if (address) {
    votedRawData?.votes.forEach(vote => {
      votedData[vote.proposal.id] = {
        choice: vote.proposal.choices[vote.choice-1],
        score: vote.vp,
        created: vote.created,
        reason: vote.reason
      }
    });
  }

  const proposalsData = proposalData?.proposals.map((proposal) => {  
    return {
      ...proposal
    }
  })

  return { data: {proposalsData, votedData}, loading, error: proposalError || votedError };
}

export function useProposalExtendedOf(proposalId: string, address: string, skip: number, orderBy: 'created' | 'vp' = 'created'): {
  loading: boolean,
  error: APIError<object>,
  data: {proposalData: ProposalDataExtended, votedData: VoteData, votesData: VoteData[]}
} {

  console.info("📗 useProposalExtendedOf ->", {proposalId, address, skip, orderBy});
  // Load proposals
  const {
    loading: proposalLoading,
    data: proposalData,
    error: proposalError
  } = useQuery(PROPOSAL_QUERY, {
    variables: {
      id: proposalId
    }
  });
  // Load related votes
  const {
    loading: voteLoading,
    data: voteData,
    error: voteError
  } = useQuery(VOTES_BY_SINGLE_PROPOSALID_QUERY, {
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
  } = useQuery(VOTED_PROPOSALS_QUERY, {
    variables: {
      voter: address,
      proposalIds: [proposalId],
      first: 1
    }
  });

  const votesData = voteData?.votes.map(vote => {
    return {
      choice: proposalData?.proposal.choices[vote.choice-1],
      score: vote.vp,
      created: vote.created,
      reason: vote.reason,
      voter: vote.voter,
      id: vote.id,
      app: vote.app || "snapshot"
    }
  })

  // Find voted proposals
  // FIXME use separate graph ql to get voted data
  let votedData: VoteData;
  if (address) {
    const t = votedRawData?.votes[0];
    if (t) {
      votedData = {
        choice: proposalData?.proposal.choices[t.choice-1],
        score: t.vp,
        created: t.created,
        reason: t.reason
      }
    }
  }

  return { 
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
}