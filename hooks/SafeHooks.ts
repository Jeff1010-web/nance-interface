import useSWR, { Fetcher } from 'swr';
import { QueueSafeTransaction, SafeBalanceUsdResponse, SafeDelegatesResponse, SafeInfoResponse, SafeMultisigTransactionResponse, SafeTransactionPartial } from '../models/SafeTypes';
import { useState } from 'react';
import { GnosisHandler } from '../libs/gnosis';
import { useAccount, useWalletClient } from 'wagmi';

const SAFE_API_V1_ROOT = "https://safe-transaction-mainnet.safe.global/api/v1/";
const SAFE_API = SAFE_API_V1_ROOT + "safes/";

function jsonFetcher(): Fetcher<SafeMultisigTransactionResponse, string> {
  return async (url) => {
    const res = await fetch(url);
    if (res.status == 400) {
      throw new Error('Invalid data.');
    } else if (res.status == 422) {
      throw new Error('Invalid ethereum address.');
    }
    const json = await res.json();

    return json;
  };
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
    const res = await fetch(url);
    if (res.status == 404) {
      throw new Error('Safe not found.');
    } else if (res.status == 422) {
      throw new Error('Safe address checksum not valid.');
    }
    const json = await res.json();

    return json;
  };
}

export function useMultisigAssets(address: string, shouldFetch: boolean = true) {
  return useSWR(
    shouldFetch ? `${SAFE_API}${address}/balances/usd/?trusted=true&exclude_spam=true` : null,
    balanceJsonFetcher(),
  );
}

function safeInfoJsonFetcher(): Fetcher<SafeInfoResponse, string> {
  return async (url) => {
    const res = await fetch(url);
    if (res.status == 404) {
      throw new Error('Safe not found.');
    } else if (res.status == 422) {
      throw new Error('Safe address checksum not valid.');
    }
    const json = await res.json();

    return json;
  };
}

export function useSafeInfo(address: string, shouldFetch: boolean = true) {
  return useSWR(
    shouldFetch ? `${SAFE_API}${address}` : null,
    safeInfoJsonFetcher(),
  );
}

function delegatesJsonFetcher(): Fetcher<SafeDelegatesResponse, string> {
  return async (url) => {
    const res = await fetch(url);
    if (res.status == 400) {
      throw new Error("Data not valid.");
    }
    const json = await res.json();

    return json;
  };
}

export function useSafeDelegates(address: string, shouldFetch: boolean = true) {
  return useSWR(
    shouldFetch ? `${SAFE_API_V1_ROOT}/delegates/?safe=${address}` : null,
    delegatesJsonFetcher(),
  );
}

export function useQueueTransaction(safeAddress: string, toContract: string, data: string, txValue: number, nonce: string) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<{safeTxHash: string, nonce: string}>();

  const { data: walletClient } = useWalletClient();
  const { address, isConnecting, isDisconnected } = useAccount();

  const gnosis = new GnosisHandler(safeAddress, 'mainnet');
  const txnPartial: SafeTransactionPartial = { to: toContract, value: txValue, data, nonce: nonce || "0" };

  const trigger = async () => {
    setLoading(true);

    try {
      // Estimate gas
      const { safeTxGas } = await gnosis.getEstimate(txnPartial);
      // Request user signature
      const { message, transactionHash } = await gnosis.getGnosisMessageToSign(safeTxGas, txnPartial);
      const signatureRaw = await walletClient?.signMessage({
        account: (await walletClient.getAddresses())[0],
        message: { raw: message }
      });
      const signature = signatureRaw?.replace(/1b$/, '1f').replace(/1c$/, '20');
      // Post transaction
      const txn: QueueSafeTransaction = {
        ...txnPartial,
        address: address || "",
        safeTxGas,
        transactionHash,
        signature: signature || ""
      };
      await gnosis.queueTransaction(txn);
      setValue({
        safeTxHash: transactionHash,
        nonce: txn.nonce
      });
    } catch(e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    value, error, loading, trigger
  }
}
