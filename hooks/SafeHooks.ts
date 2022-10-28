import useSWR, { Fetcher } from 'swr'
import { SafeMultisigTransactionResponse } from '../models/SafeTypes'

function jsonFetcher(): Fetcher<SafeMultisigTransactionResponse, string> {
    return async (url) => {
        const res = await fetch(url)
        if (res.status == 400) {
            throw new Error('Invalid data.')
        } else if (res.status == 422) {
            throw new Error('Invalid ethereum address.')
        }
        const json = await res.json()

        return json
    }
}

export function useMultisigTransactions(address: string, limit: number = 10, shouldFetch: boolean = true) {
    return useSWR(
        shouldFetch ? `https://safe-transaction.gnosis.io/api/v1/safes/${address}/multisig-transactions/?trusted=true&limit=${limit}` : null,
        jsonFetcher(),
    );
}

export function useHistoryTransactions(address: string, limit: number = 10, shouldFetch: boolean = true) {
    return useSWR(
        shouldFetch ? `https://safe-transaction.gnosis.io/api/v1/safes/${address}/multisig-transactions/?executed=true&trusted=true&limit=${limit}` : null,
        jsonFetcher(),
    );
}

export function useQueuedTransactions(address: string, nonceGte: number, limit: number = 10, shouldFetch: boolean = true) {
    return useSWR(
        shouldFetch ? `https://safe-transaction.gnosis.io/api/v1/safes/${address}/multisig-transactions/?nonce__gte=${nonceGte}&trusted=true&limit=${limit}` : null,
        jsonFetcher(),
    );
}