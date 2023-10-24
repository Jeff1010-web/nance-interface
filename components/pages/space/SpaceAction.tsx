import { useState } from "react";

import Link from "next/link";
import dynamic from "next/dynamic";

import { BanknotesIcon, BoltIcon, DocumentTextIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

import LoadingArrowSpiner from "../../LoadingArrowSpiner";
import { StringParam, useQueryParams } from "next-query-params";
import { SpaceInfo } from "../../../models/NanceTypes";
import { ChainValidator } from "../../ethereum/ChainValidator";


const QueueReconfigurationModal = dynamic(() => import("./action/QueueReconfigurationModal"), {
  loading: () => <LoadingArrowSpiner />,
});
const QueueTransactionsModal = dynamic(() => import("./action/QueueTransactionsModal"), {
  loading: () => <LoadingArrowSpiner />,
});

export default function SpaceAction({ spaceInfo }: { spaceInfo: SpaceInfo }) {
  const [showQueueReconfigurationModal, setShowQueueReconfigurationModal] = useState(false);
  const [showQueueTransactionsModal, setShowQueueTransactionsModal] = useState(false);

  const [query, setQuery] = useQueryParams({
    cycle: StringParam
  });

  const spaceName = spaceInfo.name;
  const projectId = parseInt(spaceInfo.juiceboxProjectId || "1");
  const currentCycle = spaceInfo.currentCycle.toString();

  return (
    <div className="max-w-7xl flex flex-col space-y-2 md:flex-row md:space-x-5 md:space-y-0 bg-white mt-2 p-2 shadow rounded-md">
      {spaceInfo.transactorAddress && <ChainValidator supportedNetwork={spaceInfo.transactorAddress.network} />}

      <Link
        id="new-proposal-button"
        href={`/s/${spaceName}/edit`}
        className="md:ml-2 inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <DocumentTextIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        New Proposal
      </Link>

      <button
        type="button"
        onClick={() => {
          setQuery({ cycle: currentCycle });
          setShowQueueReconfigurationModal(true);
        }}
        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <BanknotesIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Queue Reconfiguration
      </button>
      {showQueueReconfigurationModal && <QueueReconfigurationModal open={showQueueReconfigurationModal} setOpen={setShowQueueReconfigurationModal} juiceboxProjectId={projectId} space={spaceName} currentCycle={spaceInfo.currentCycle} />}

      <button
        type="button"
        onClick={() => {
          setQuery({ cycle: currentCycle });
          setShowQueueTransactionsModal(true);
        }}
        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <BoltIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Queue Transactions
      </button>
      {showQueueTransactionsModal && <QueueTransactionsModal open={showQueueTransactionsModal} setOpen={setShowQueueTransactionsModal} juiceboxProjectId={projectId} space={spaceName} />}

      <Link
        href={`/review?project=${projectId}`}
        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <ShieldCheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Review Reconfiguration
      </Link>

    </div>
  )
}
