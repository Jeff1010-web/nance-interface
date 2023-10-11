import { getAddress } from "viem";
import { useEtherscanContractABI } from "./EtherscanHooks";
import { useQueueTransaction, useSafeInfo } from "./SafeHooks";
import usePropose from "./governor/Propose";
import { FunctionFragment, Interface } from "ethers/lib/utils";

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
  if (rawAddress === "") return ContractType.Unknown;

  const address = getAddress(rawAddress);
  const { data: safeInfo, error: safeError } = useSafeInfo(address);
  const { data: abi, error: etherscanError } = useEtherscanContractABI(address);

  if (!safeError && safeInfo?.masterCopy) {
    return ContractType.Safe;
  } else if (!etherscanError && abi) {
    const ethersInterface = new Interface(abi || []);
    const fragmentMap: { [key: string]: FunctionFragment } = {};
    Object.values(ethersInterface.functions || {}).forEach(f => fragmentMap[f.format("full")] = f);
    console.debug("useContractType.fragmentMap", fragmentMap);
    if (fragmentMap["propose(address[],uint256[],bytes[],string) external returns (uint256)"]) {
      return ContractType.Governor;
    }
  }

  return ContractType.Unknown;
}
