import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useHistoryTransactions, useQueueTransaction } from "../../hooks/SafeHooks";


export default function SafeTransactionCreator(
  { safeAddress, toContract, data, value }: 
  { safeAddress: string, toContract: string, data: string, value: number, defaultNonce: string }) {

  const [nonce, setNonce] = useState<string>("");

  const { value: queueRes, loading, error, trigger } = useQueueTransaction(safeAddress, toContract, data, value, nonce);
  const { data: historyTxs, isLoading: historyTxsLoading } = useHistoryTransactions(safeAddress, 1, safeAddress !== "");
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (nonce === "" && historyTxs?.countUniqueNonce) {
      setNonce(historyTxs.countUniqueNonce.toString());
    }
  }, [historyTxs])

  return (
    <span className="isolate inline-flex rounded-md shadow-sm">
      <button
        type="button"
        disabled={!walletClient || !data}
        onClick={trigger}
        className="relative inline-flex items-center gap-x-1.5 rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:opacity-50"
      >      
        {loading && <ArrowPathIcon className="animate-spin -ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />}
        Queue with nonce
      </button>
      <input
        type="number"
        step={1}
        min={historyTxs?.count || 0}
        value={nonce}
        onChange={(e) => setNonce(e.target.value)}
        className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 w-20"
      />
    </span>
  )
}