import { useContext, useState } from "react";
import { useWalletClient } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import ResultModal from "../modal/ResultModal";
import usePropose from "@/utils/hooks/governor/Propose";
import { GenericTransactionData } from "./TransactionCreator";
import { getTxLink } from "@/utils/functions/EtherscanURL";
import { NetworkContext } from "@/context/NetworkContext";

export default function GovernorTransactionCreator({
  governorAddress,
  transactionDatas,
}: {
  governorAddress: string;
  transactionDatas: GenericTransactionData[];
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("New proposal");

  const network = useContext(NetworkContext);

  const { data, error, isLoading, write } = usePropose(
    governorAddress as `0x${string}`,
    transactionDatas.map(
      (transactionData) => transactionData.to as `0x${string}`,
    ),
    transactionDatas.map((transactionData) => transactionData.value),
    transactionDatas.map((transactionData) => transactionData.data),
    description,
  );
  const { data: walletClient } = useWalletClient();

  const queueNotReady =
    !walletClient || !transactionDatas || !governorAddress || isLoading;

  let tooltip = "Propose with title";
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
          setOpen(true);
          write?.();
        }}
        className="relative inline-flex items-center gap-x-1.5 rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:opacity-50"
      >
        {isLoading && (
          <ArrowPathIcon
            className="-ml-0.5 h-5 w-5 animate-spin text-gray-400"
            aria-hidden="true"
          />
        )}
        {tooltip}
      </button>

      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="relative -ml-px inline-flex w-40 items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
      />

      {error && (
        <ResultModal
          title="Error"
          description={error.message}
          buttonText="Close"
          onClick={() => setOpen(false)}
          isSuccessful={false}
          shouldOpen={open}
          close={() => setOpen(false)}
        />
      )}
      {data && (
        <ResultModal
          title="Success"
          description={`Transaction queued as txn-${data.hash}`}
          buttonText="Go to Etherscan Tx"
          onClick={() => window.open(getTxLink(data.hash, network), "_blank")}
          isSuccessful={true}
          shouldOpen={open}
          close={() => setOpen(false)}
        />
      )}
    </span>
  );
}
