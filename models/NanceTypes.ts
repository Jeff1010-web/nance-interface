// from https://github.com/jigglyjams/nance-ts/blob/main/src/types.ts
export interface Proposal {
  hash: string;
  title: string;
  markdown?: string;
  translation?: {
    markdown?: string;
    language?: string;
  },
  payout?: Payout,
  url: string;
  governanceCycle?: number;
  date?: string,
  translationURL?: string | undefined;
  category?: string | undefined;
  status: string;
  proposalId: string;
  author?: string;
  discussionThreadURL: string;
  ipfsURL: string;
  voteURL: string;
  voteResults?: VoteResults;
}

export type Payout = {
  type: 'onetime' | 'recurring';
  address: string;
  amountUSD: number;
  count?: number;
  treasuryVersion?: string;
};

export type Reserve = {
  address: string;
  percentage: number;
};

export type ProposalNoHash = Omit<Proposal, 'hash'>;

export type ProposalStore = Record<string, ProposalNoHash>;

export interface NanceConfig {
  nameId: string;
  name: string;
  calendarPath: string;
  scheme: string[];
  proposalDataBackup: string;
  ipfsGateway: string;
  votingResultsDashboard: string;
  translation: {
    api: string;
    targetLanguage: any;
    storage: {
      user: string;
      repo: string;
    }
  };
  juicebox: {
    network: 'mainnet' | 'rinkeby';
    projectId: string;
    gnosisSafeAddress: string;
  };
  discord: {
    API_KEY: string;
    guildId: string;
    channelId: string;
    alertRole: string;
    poll: {
      voteYesEmoji: string;
      voteNoEmoji: string;
      voteGoVoteEmoji: string;
      votePassEmoji: string;
      voteCancelledEmoji: string;
      minYesVotes: number;
      yesNoRatio: number;
      showResults: boolean;
    };
  };
  notion: {
    API_KEY: string;
    publicURLPrefix: string;
    database_id: string;
    payouts_database_id: string;
    reserves_database_id: string;
    propertyKeys: {
      proposalId: string;
      status: string;
      statusTemperatureCheck: string;
      statusVoting: string;
      statusApproved: string;
      statusCancelled: string;
      proposalIdPrefix: string;
      discussionThread: string;
      ipfs: string;
      vote: string;
      category: string;
      categoryRecurringPayout: string;
      categoryPayout: string;
      governanceCycle: string;
      governanceCyclePrefix: string;
      reservePercentage: string;
      payoutName: string;
      payoutType: string;
      payoutAmountUSD: string;
      payoutAddress: string;
      payoutCount: string;
      treasuryVersion: string;
      payoutFirstFC: string;
      payoutLastFC: string;
      payoutRenewalFC: string;
      payoutProposalLink: string;
    };
    filters: any;
  };
  github: {
    user: string;
    repo: string;
    propertyKeys: {
      title: string;
      proposalId: string;
      status: string;
      statusTemperatureCheck: string;
      statusVoting: string;
      statusApproved: string;
      statusCancelled: string;
      proposalIdPrefix: string;
      discussionThread: string;
      ipfs: string;
      vote: string;
      category: string;
      governanceCycle: string;
    },
  },
  snapshot: {
    base: string;
    space: string;
    choices: string[];
    minTokenPassingAmount: number;
    passingRatio: number;
  };
}

export interface VoteResults {
  voteProposalId: string;
  totalVotes: number;
  scoresState: string;
  scores: Record<string, number>;
  percentages: Record<string, number>;
  outcomePercentage: string;
  outcomeEmoji: string;
}

export interface DateEvent {
  title: string;
  start: Date;
  end: Date;
  inProgress: boolean;
}

export interface PollResults {
  voteYesUsers: string[];
  voteNoUsers: string[];
}

export interface PollEmojis {
  voteYesEmoji: string;
  voteNoEmoji: string;
}

export interface PinataKey {
  KEY: string;
  SECRET: string;
}

export interface GithubFileChange {
  path: string,
  contents: string
}