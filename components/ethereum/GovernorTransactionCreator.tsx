import { useState } from "react";
import { useWalletClient } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import ResultModal from "../modal/ResultModal";
import usePropose from "../../hooks/governor/Propose";
import { GenericTransactionData } from "./TransactionCreator";

export default function GovernorTransactionCreator(
  { governorAddress, transactionDatas, description = "Queued from nance.app" }:
    { governorAddress: string, transactionDatas: GenericTransactionData[], description?: string }) {

  const [open, setOpen] = useState<boolean>(false);

  const { data, error, isLoading, write } = usePropose(
    governorAddress as `0x${string}`,
    transactionDatas.map((transactionData) => transactionData.to as `0x${string}`),
    transactionDatas.map((transactionData) => transactionData.value),
    transactionDatas.map((transactionData) => transactionData.data),
    description);
  const { data: walletClient } = useWalletClient();

  const queueNotReady = !walletClient || !transactionDatas || !governorAddress || isLoading;

  let tooltip = "Queue with nonce";
  if (!walletClient) {
    tooltip = "Wallet not connected";
  } else if (!transactionDatas || !governorAddress) {
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

      {error && <ResultModal title="Error" description={error.message} buttonText="Close" onClick={() => setOpen(false)} isSuccessful={false} shouldOpen={open} close={() => setOpen(false)} />}
      {data && <ResultModal title="Success" description={`Transaction queued as txn-${data.hash}`} buttonText="Go to Etherscan Tx" onClick={() => window.open(`https://etherscan.io/tx/${data.hash}`, "_blank")} isSuccessful={true} shouldOpen={open} close={() => setOpen(false)} />}
    </span>
  );
}
