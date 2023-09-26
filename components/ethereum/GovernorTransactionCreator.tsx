import { useState } from "react";
import { useWalletClient } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import ResultModal from "../modal/ResultModal";
import { getSafeTxUrl } from "../../libs/gnosis";
import usePropose from "../../hooks/governor/Propose";

interface TransactionData {
  target: string,
  value: string,
  calldata: string
}

export default function GovernorTransactionCreator(
  { governorAddress, transactionData, description = "Queued from nance.app" }:
    { governorAddress: string, transactionData: TransactionData, description?: string }) {

  const [open, setOpen] = useState<boolean>(false);

  const { data, isLoading, isSuccess, write } = usePropose(
    governorAddress as `0x${string}`,
    [transactionData.target as `0x${string}`],
    [transactionData.value],
    [transactionData.calldata],
    description);
  const { data: walletClient } = useWalletClient();

  const queueNotReady = !walletClient || !transactionData || !governorAddress || isLoading;

  let tooltip = "Queue with nonce";
  if (!walletClient) {
    tooltip = "Wallet not connected";
  } else if (!transactionData || !governorAddress) {
    tooltip = "Transaction not ready";
  } else if (isLoading) {
    tooltip = "Loading...";
  }

  return (
    <span className="isolate inline-flex rounded-md shadow-sm">
      <button
        type="button"
        disabled={queueNotReady}
        onClick={() => {
          setOpen(true); write?.();
        }}
        className="relative inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:opacity-50"
      >
        {isLoading && <ArrowPathIcon className="animate-spin -ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />}
        {tooltip}
      </button>

      {error && <ResultModal title="Error" description={error} buttonText="Close" onClick={() => setOpen(false)} isSuccessful={false} shouldOpen={open} close={() => setOpen(false)} />}
      {queueRes && <ResultModal title="Success" description={`Transaction queued as txn-${queueRes.safeTxHash} (nonce: ${queueRes.nonce})`} buttonText="Go to Safe App" onClick={() => window.open(getSafeTxUrl(safeAddress, queueRes.safeTxHash), "_blank")} isSuccessful={true} shouldOpen={open} close={() => setOpen(false)} />}
    </span>
  );
}
