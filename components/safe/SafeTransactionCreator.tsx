import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useHistoryTransactions, useQueueTransaction } from "../../hooks/SafeHooks";
import ResultModal from "../modal/ResultModal";
import { getSafeTxUrl } from "../../libs/gnosis";

export default function SafeTransactionCreator(
  { safeAddress, toContract, data, value }: 
  { safeAddress: string, toContract: string, data: string, value: number, defaultNonce: string }) {

  const [open, setOpen] = useState<boolean>(false);
  const [nonce, setNonce] = useState<string>("");

  const { value: queueRes, loading, error, trigger } = useQueueTransaction(safeAddress, toContract, data, value, nonce);
  const { value: historyTxs, loading: historyTxsLoading } = useHistoryTransactions(safeAddress, safeAddress !== "");
  const { data: walletClient } = useWalletClient();

  const queueNotReady = !walletClient || !data || !nonce || !safeAddress || !toContract || loading;

  useEffect(() => {
    const _historyTxs = historyTxs as any;
    if (nonce === "" && _historyTxs?.countUniqueNonce) {
      setNonce(_historyTxs.countUniqueNonce.toString());
    }
  }, [historyTxs])

  return (
    <span className="isolate inline-flex rounded-md shadow-sm">
      <button
        type="button"
        disabled={queueNotReady}
        onClick={() => {setOpen(true); trigger();}}
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

      {error && <ResultModal title="Error" description={error} buttonText="Close" onClick={() => setOpen(false)} isSuccessful={false} shouldOpen={open} close={() => setOpen(false)} />}
      {queueRes && <ResultModal title="Success" description={`Transaction queued as txn-${queueRes.safeTxHash} (nonce: ${queueRes.nonce})`} buttonText="Go to Safe App" onClick={() => window.open(getSafeTxUrl(safeAddress, queueRes.safeTxHash), "_blank")} isSuccessful={true} shouldOpen={open} close={() => setOpen(false)} />}
    </span>
  )
}