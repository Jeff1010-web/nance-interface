import { BigNumber } from "ethers";

export interface APIResponse<T> {
  success: boolean;
  error: string;
  data: T;
}

export type SpaceInfo = {
  name: string,
  currentCycle: number,
  currentEvent: {
    title: string,
    start: string,
    end: string
  }
};

export type ProposalUploadPayload = {
  hash: string;
}

export type APIErrorResponse = APIResponse<undefined>;

interface BaseRequest {
  space: string;
}

export interface ProposalsRequest extends BaseRequest {
  cycle: number | undefined;
  keyword: string | undefined;
}

export type SpaceInfoRequest = BaseRequest;

export interface ProposalRequest extends BaseRequest {
  hash: string;
}

export interface FetchReconfigureRequest extends BaseRequest {
  version: string;
  address: string;
  datetime: string;
  network: string;
}

export interface SubmitTransactionRequest extends BaseRequest {
  version: string;
  datetime: string;
  signature: Signature
}

export interface FetchReconfigureData {
  transaction: NanceBasicTransaction;
  nonce: string;
  safe: string;
}

export interface NanceBasicTransaction {
  address: string;
  bytes: string;
}

export interface Signature {
  address: string;
  signature: string;
  timestamp: number;
}

export interface SignatureRequest {
  signature: Signature
}

export interface ProposalUploadRequest extends SignatureRequest {
  // presented when editting proposal
  hash?: string
  proposal: Pick<Proposal, "title" | "body" | "notification" | "actions">;
}

// from https://github.com/jigglyjams/nance-ts/blob/main/src/types.ts
type ProposalType = 'Payout' | 'ReservedToken' | 'ParameterUpdate' | 'ProcessUpdate' | 'CustomTransaction';

export interface Proposal {
  hash: string;
  title: string;
  body?: string;
  translation?: {
    body?: string;
    language?: string;
  },
  notification?: Notification;
  url: string;
  governanceCycle?: number;
  date?: string,
  translationURL?: string;
  status: string;
  proposalId: number | null;
  payout: Payout;
  author?: string;
  discussionThreadURL: string;
  ipfsURL: string;
  voteURL: string;
  voteSetup?: SnapshotVoteOptions;
  internalVoteResults?: InternalVoteResults;
  voteResults?: VoteResults;
  authorAddress?: string;
  authorDiscordId?: string;
  temperatureCheckVotes?: number[];
  createdTime?: Date;
  lastEditedTime?: Date;
  actions: Action[];
}

export type Action = {
  type: 'Payout' | 'Reserve' | 'Transfer' | 'Custom Transaction';
  payload: Payout | Reserve | Transfer | CustomTransaction;
}

export type Payout = {
  type?: 'address' | 'project' | 'allocator';
  address: string;
  project?: number;
  amountUSD: number;
  count: number;
  payName: string;
  uuid?: string;
};

type Notification = {
  discordUserId: string;
  expiry: boolean;
  execution: boolean;
  progress: boolean;
};

export type Reserve = {
  address: string;
  percentage: number;
};

export type Transfer = {
  contract: string;
  to: string;
  amount: number;
}

export type CustomTransaction = {
  contract: string;
  value: number;
  abi: any[];
  functionName: string;
  args: any[];
}

export type ParameterUpdate = {
  durationDays: number;
  discountPercentage: number;
  reservedPercentage: number;
  redemptionPercentage: number;
};

export type InternalVoteResults = {
  voteProposalId: string;
  totalVotes: number;
  scoresState: string;
  scores: Record<string, number>;
  percentages: Record<string, number>;
  outcomePercentage: string;
  outcomeEmoji: string;
};

export type VoteResults = {
  choices: string[];
  scores: number[];
  votes: number;
};

export type GnosisTransaction = {
  address: string;
  bytes: string;
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

export type SnapshotVoteOptions = {
  type: string,
  choices: string[]
};
