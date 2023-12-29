export interface SpaceMetric {
  categories?: string[];
  followers?: number;
  proposals?: number;
  name: string;
  network: string;
  networks: string[];
}

export interface SpaceInfo {
  name: string;
  about: string;
  avatar: string;
  network: string;
  proposalsCount: number;
  followersCount: number;
  voting: {
    hideAbstain: boolean;
  };
  symbol: string;
  validation: {
    name: string;
    params: any;
  };
  voteValidation: {
    name: string;
    params: any;
  };
}

export interface SpaceSettings {
  name: string;
  avatar: string;
  about: string;
  network: string;
  symbol: string;
  website: string;
  twitter: string;
  github: string;
  coingecko: string;
  domain: string;
  skin: string;
  guidelines: string;
  template: string;
  private: boolean;
  moderators: string[];
  members: string[];
  admins: string[];
  categories: string[];
  plugins: {
    hal: {};
  };
  parent: string;
  children: string[];
  voting: {
    delay: number;
    hideAbstain: boolean;
    period: number;
    quorum: number;
    type: string;
    privacy: string;
  };
  strategies: {
    name: string;
    network: string;
    params: {
      symbol: string;
    };
  }[];
  validation: {
    name: string;
    params: {};
  };
  filters: {
    onlyMembers: boolean;
  };
  voteValidation: {
    name: string;
    params: {};
  };
  treasuries: string[];
}

export interface SpaceSearch {
  id: string;
  name: string;
  avatar: string;
  admins: string[];
  moderators: string[];
}

export interface AllSpacesResponse {
  [spaceId: string]: SpaceMetric;
}

export interface FollowedSpacesData {
  id: string;
  name: string;
  activeProposals: number;
}

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
  ipfs: string; // bafkreiete6tryrhksyt5gowckreabilu57zl4shjrl6kptkfy7oiowqd44
  snapshot: string; // 16922147
  // voting
  choices: string[];
  scores: number[];
  votes: number;
  quorum: number;
  scores_total: number;
}

export interface ProposalOverviewQueryModel {
  proposals: {
    id: string;
    state: string;
    quorum: number;
    scores_total: number;
  }[];
  votes: {
    id: string;
    proposal: {
      id: string;
    };
  }[];
}

export interface SnapshotProposalsOverview {
  [id: string]: {
    // active closed pending
    state: string;
    // under quorum?
    scores_total: number;
    quorum: number;
    // voted?
    voted: boolean;
  };
}

export interface SnapshotSpaceWithVotesCount {
  id: string;
  name: string;
  votes: number;
}

export interface AllVotes {
  total: number;
  for: number;
  against: number;
  abstain: number;
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

export type SnapshotVotedData = Omit<
  SnapshotVote & {
    proposal: {
      id: string;
      choices: string[];
      type: string;
      title: string;
    };
    space: {
      id: string;
      name: string;
    };
  },
  "voter"
>;
