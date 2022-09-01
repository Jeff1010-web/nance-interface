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
query VotesBySingleProposalId($first: Int, $id: String) {
  votes (
    first: $first
    where: {
      proposal: $id
    }
    orderBy: "created",
    orderDirection: desc
  ) {
    id
    voter
    vp
    choice
    reason
    created
  }
}
`

const VOTED_PROPOSALS_QUERY = `
query VotedProposals($first: Int, $space: String, $voter: String, $proposalIds: [String]) {
  votes (
    first: $first
    where: {
      space: $space,
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
  votes: number
  quorum: number
  scores_total: number
  body: string
  voteByChoice: { [key: string]: number }
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
  // Load related votes
  const {
    loading: voteLoading,
    data: voteData,
    error: voteError
  } = useQuery(VOTES_BY_PROPOSALID_QUERY, {
    variables: {
      first: proposalData?.proposals.map(proposal => proposal.votes).reduce((a, b) => a + b, 0),
      space: space,
      proposalIds: proposalData?.proposals.map(proposal => proposal.id)
    }
  });
  // Load voted proposals
  const {
    loading: votedLoading,
    data: votedRawData,
    error: votedError
  } = useQuery(VOTED_PROPOSALS_QUERY, {
    variables: {
      space: space,
      voter: address,
      proposalIds: proposalData?.proposals.map(proposal => proposal.id),
      first: proposalData?.proposals.length || 0
    }
  });

  const loading = proposalLoading || voteLoading || votedLoading;
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
  // Calculate voteByChoices
  // { [proposalId]: { [choice]: score } }
  const votes = voteData?.votes.reduce((acc, vote) => {
    if(!acc[vote.proposal.id]) {
      acc[vote.proposal.id] = {};
      vote.proposal.choices.forEach(choice => {
        acc[vote.proposal.id][choice] = 0;
      });
    }

    // 1-index, 1 means affirmative
    acc[vote.proposal.id][vote.proposal.choices[vote.choice-1]] += vote.vp;
    return acc
  }, {});

  const proposalsData = proposalData?.proposals.map((proposal) => {  
    return {
      voteByChoice: votes?.[proposal.id] || [],
      ...proposal
    }
  })

  return { data: {proposalsData, votedData}, loading, error: proposalError || voteError || votedError };
}

export function useProposalExtendedOf(proposalId: string, address: string): {
  loading: boolean,
  error: APIError<object>,
  data: {proposalData: ProposalDataExtended, votedData: VoteData, votesData: VoteData[]}
} {

  console.info("📗 useProposalExtendedOf ->", {proposalId, address});
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
      first: proposalData?.proposal.votes,
      id: proposalId
    }
  });

  const votesData = voteData?.votes.map(vote => {
    return {
      choice: proposalData?.proposal.choices[vote.choice-1],
      score: vote.vp,
      created: vote.created,
      reason: vote.reason,
      voter: vote.voter,
      id: vote.id
    }
  })

  // Find voted proposals
  let votedData: VoteData;
  if (address) {
    const t = voteData?.votes.find((vote) => vote.voter == address)
    if (t) {
      votedData = {
        choice: proposalData?.proposal.choices[t.choice-1],
        score: t.vp,
        created: t.created,
        reason: t.reason
      }
    }
  }
  // Calculate voteByChoices
  // { [proposalId]: { [choice]: score } }
  const voteByChoice: { [choice: string]: number } = {};
  proposalData?.proposal.choices.forEach((c: string) => voteByChoice[c] = 0)
  voteData?.votes.forEach((vote) => {
    voteByChoice[proposalData?.proposal.choices[vote.choice-1]] += vote.vp;
  });

  return { 
    data: {
      proposalData: {
        voteByChoice,
        ...proposalData?.proposal
      }, 
      votedData,
      votesData
    }, 
    loading: proposalLoading || voteLoading, 
    error: proposalError || voteError 
  };
}