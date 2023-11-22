export const SPACE_INFO_QUERY = `
query SpaceInfo($spaceId: String) {
  space(id: $spaceId) {
    name
    about
    avatar
    proposalsCount
    followersCount
    voting {
      hideAbstain
    }
  }
}
`;

export const SPACES_QUERY = `
query Spaces($address: String) {
    follows(
        first: 25,
        where: {
            follower: $address
        }
    ) {
        space {
            id
            name
        }
        created
    }
}
`;

export const SPACE_RANK_QUERY = `
query Ranking($search: String) {
  ranking(
    first: 20
    skip: 0
    where: {search: $search }
  ) {
    items {
      id
      name
      avatar
      admins
      moderators
    }
  }
}
`;

export const SPACE_SETTINGS_QUERY = `
query SpaceSettings($spaceId: String) {
  space(id: $spaceId) {
    name
    private
    about
    guidelines
    template
    terms
    avatar
    location
    website
    twitter
    coingecko
    github
    email
    network
    symbol
    skin
    domain
    strategies {
      name
      network
      params
    }
    members
    admins
    moderators
    plugins
    filters {
      minScore
      onlyMembers
    }
    validation {
      name
      params
    }
    voting {
      quorum
      blind
      hideAbstain
      aliased
      privacy
      type
      delay
      period
    }
    categories
    treasuries {
      name
      address
      network
    }
    parent {
      id
    }
    children {
      id
    }
    delegationPortal {
      delegationApi
      delegationType
      delegationContract
    }
  }
}
`;
