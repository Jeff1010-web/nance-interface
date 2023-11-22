export const ACTIVE_PROPOSALS_QUERY = `
query Proposals($spaceIds: [String]) {
    proposals(
      first: 250
      skip: 0
      where: {
        space_in: $spaceIds,
        state: "active"
      }
      orderBy: "created",
      orderDirection: desc
    ) {
      space {
        id
      }
      id
    }
  }
`;

export const PROPOSALS_QUERY = `
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
    scores_total,
    ipfs,
    snapshot
  }
}
`;

export const PROPOSALS_BY_ID_QUERY = `
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
    scores_total,
    ipfs,
    snapshot
  }
}
`;

export const PROPOSALS_OVERVIEW_QUERY = `
query ProposalsOverview($first: Int, $space: String, $address: String) {
  proposals(
    first: $first
    skip: 0
    where: {
      space: $space
    }
    orderBy: "created",
    orderDirection: desc
  ) {
    id,
    state,
    quorum,
    scores_total
  }
  
  votes (
    first: $first
    skip: 0
    where: {
      space: $space
      voter: $address
    }
    orderBy: "created",
    orderDirection: desc
  ) {
    id
    proposal {
      id
    }
  }
}
`;
