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