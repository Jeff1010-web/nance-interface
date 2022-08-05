import { useQuery } from 'graphql-hooks'

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
    vp
    created
  }
}
`

export function useProposalsExtendedOf(space: string, active: boolean, keyword: string, address: string, first: number) {
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
        created: vote.created
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