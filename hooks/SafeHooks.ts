import useSWR, { Fetcher } from 'swr';
import { SafeBalanceUsdResponse, SafeDelegatesResponse, SafeInfoResponse, SafeMultisigTransactionResponse } from '../models/SafeTypes';
import { useEffect, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import SafeApiKit from '@safe-global/api-kit';
import { useEthersSigner } from './ViemAdapter';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';

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

export function useSafeAPIKit() {
  const [value, setValue] = useState<SafeApiKit>();
  const signer = useEthersSigner();
  
  useEffect(() => {
    if (!signer) {
      return;
    }

    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer!
    })
    const safeApiKit = new SafeApiKit({
      txServiceUrl: 'https://safe-transaction-mainnet.safe.global',
      ethAdapter
    });
    setValue(safeApiKit);
  }, [signer]);

  return { value, loading: !value };
}

export function useSafe(safeAddress: string) {
  const [error, setError] = useState<string>();
  const [value, setValue] = useState<Safe>();
  const signer = useEthersSigner();
  
  useEffect(() => {
    if (!signer || !safeAddress) {
      return;
    }

    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer
    })
    Safe.create({
      ethAdapter,
      safeAddress
    }).then(safe => setValue(safe))
    .catch(err => setError(err));
  }, [signer, safeAddress]);

  return { value, loading: !value, error };
}

export function useQueueTransaction(safeAddress: string, toContract: string, data: string, txValue: number, nonce: string) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<{safeTxHash: string, nonce: string}>();

  const { data: walletClient } = useWalletClient();
  const { address, isConnecting, isDisconnected } = useAccount();
  const { value: safeApiKit } = useSafeAPIKit();
  const { value: safe } = useSafe(safeAddress);

  //const gnosis = new GnosisHandler(safeAddress, 'mainnet');
  
  const safeTransactionData: SafeTransactionDataPartial = { to: toContract, value: txValue.toString(), data, nonce: parseInt(nonce || "0") };

  const trigger = async () => {
    if (!safe || !walletClient || !safeApiKit || !address) {
      setError("Not connected to wallet or safe not found.");
      return;
    }

    setLoading(true);

    try {
      const safeTransaction = await safe.createTransaction({ safeTransactionData });
      const senderAddress = address;
      const safeTxHash = await safe.getTransactionHash(safeTransaction)
      const signature = await safe.signTransactionHash(safeTxHash)

      // Propose transaction to the service
      await safeApiKit.proposeTransaction({
        safeAddress: await safe.getAddress(),
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress,
        senderSignature: signature.data
      })

      setValue({
        safeTxHash: safeTxHash,
        nonce
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
