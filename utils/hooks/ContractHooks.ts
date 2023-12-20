import { getAddress } from "viem";
import { useQueueTransaction, useSafeInfo } from "./Safe/SafeHooks";
import usePropose from "./governor/Propose";
import { isAddress } from "ethers/lib/utils";

export interface TransactionData {
  to: string;
  value: string;
  data: string;
}

function transactionsToTuples(transactions: TransactionData | TransactionData[]) {
  const transactionArray = Array.isArray(transactions) ? transactions : [transactions];

  const targets = transactionArray.map(t => t.to);
  const values = transactionArray.map(t => t.value);
  const calldatas = transactionArray.map(t => t.data);

  return [targets, values, calldatas];
}

export default function useQueueTransactionToContract(address: string, transactions: TransactionData | TransactionData[], nonce?: string) {
  // TODO to decide whether address is a safe or a governor
  const { value, loading, error, trigger } = useQueueTransaction(address, transactions, parseInt(nonce || "0"));
  const tuples = transactionsToTuples(transactions);
  const { data, isLoading, isSuccess, write } = usePropose(address as `0x${string}`, tuples[0] as `0x${string}`[], tuples[1], tuples[2], "Haha");

  return {
    value: value || data,
    loading: loading || isLoading,
    error: error || (isSuccess ? undefined : "Error proposing transaction"),
    trigger: trigger || write
  };
}

export enum ContractType {
  Safe,
  Governor,
  Unknown
}

export function useContractType(rawAddress: string) {
  const address = isAddress(rawAddress) ? getAddress(rawAddress) : undefined;
  const { data: safeInfo, error: safeError } = useSafeInfo(address as string, address !== undefined);

  if (address === undefined) {
    return ContractType.Unknown;
  }

  if (!safeError && safeInfo?.masterCopy) {
    return ContractType.Safe;
  } else {
    // there is no way to be sure if this is a governor contract
    //  the contract may be unverified
    return ContractType.Governor;
  }
}
