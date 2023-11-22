export const VOTES_OF_PROPOSAL_QUERY = `
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
`;

export const VOTED_PROPOSALS_QUERY = `
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
`;

export const ALL_VOTES_OF_USER = `
query AllVotesOfUser($first: Int, $voter: String, $space: String) {
  votes (
    first: $first,
    where: {
      voter: $voter,
      space: $space
    }
    orderBy: "created",
    orderDirection: desc
  ) {
    id
    choice
    proposal {
      type
    }
  }
}
`;

export const VOTING_POWER_QUERY = `
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
`;
