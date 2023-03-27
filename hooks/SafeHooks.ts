import useSWR, { Fetcher } from 'swr'
import { SafeBalanceUsdResponse, SafeMultisigTransactionResponse } from '../models/SafeTypes'

const SAFE_API = 'https://safe-transaction-mainnet.safe.global/api/v1/safes/'

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
    shouldFetch ? `${SAFE_API}${address}/multisig-transactions/?trusted=true&limit=${limit}` : null,
    jsonFetcher(),
  );
}

export function useHistoryTransactions(address: string, limit: number = 10, shouldFetch: boolean = true) {
  return useSWR(
    shouldFetch ? `${SAFE_API}${address}/multisig-transactions/?executed=true&trusted=true&limit=${limit}` : null,
    jsonFetcher(),
  );
}

export function useQueuedTransactions(address: string, nonceGte: number, limit: number = 10, shouldFetch: boolean = true) {
  return useSWR(
    shouldFetch ? `${SAFE_API}${address}/multisig-transactions/?nonce__gte=${nonceGte}&trusted=true&limit=${limit}` : null,
    jsonFetcher(),
  );
}

export function useMultisigTransactionOf(address: string, safeTxHash: string, shouldFetch: boolean = true) {
  return useSWR(
    shouldFetch ? `${SAFE_API}${address}/multisig-transactions/?safe_tx_hash=${safeTxHash}` : null,
    jsonFetcher(),
  );
}

function balanceJsonFetcher(): Fetcher<SafeBalanceUsdResponse[], string> {
  return async (url) => {
    const res = await fetch(url)
    if (res.status == 404) {
      throw new Error('Safe not found.')
    } else if (res.status == 422) {
      throw new Error('Safe address checksum not valid.')
    }
    const json = await res.json()

    return json
  }
}

export function useMultisigAssets(address: string, shouldFetch: boolean = true) {
  return useSWR(
    shouldFetch ? `${SAFE_API}${address}/balances/usd/?trusted=true&exclude_spam=true` : null,
    balanceJsonFetcher(),
  );
}
