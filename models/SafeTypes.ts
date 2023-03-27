export interface SafeMultisigConfirmation {
  owner: string
  submissionDate: string
  transactionHash?: string
  signature: string
  signatureType?: string
}

export interface SafeMultisigTransaction {
  safe: string
  to: string
  value: string
  data?: string
  nonce: number
  submissionDate: string
  executionDate: string
  safeTxHash: string
  transactionHash: string
  origin: string
  dataDecoded: {
    method: string
    parameters: object[]
  } | null
  isExecuted: boolean
  confirmations?: SafeMultisigConfirmation[]
}

export interface SafeMultisigTransactionResponse {
  count: number;
  next?: string;
  previous?: string;
  results: SafeMultisigTransaction[];
}

export interface SafeMultisigTransactionRequest {
  address: string;
  limit?: number;
  offset?: number;
  nonceGte?: number;
}

export interface SafeTransactionPartial {
  to: string;
  value: number;
  data: string;
  nonce: string;
}

export interface QueueSafeTransaction extends SafeTransactionPartial {
  address: string;
  safeTxGas: string;
  transactionHash: string;
  signature: string;
}

export interface SafeBalanceUsdResponse {
  tokenAddress: string | null;
  token: {
    name: string;
    symbol: string;
    decimals: number;
    logoUri: string;
  } | null
  balance: string;
  ethValue: string;
  timestamp: string;
  fiatBalance: string;
  fiatConversion: string;
  fiatCode: string;
}
