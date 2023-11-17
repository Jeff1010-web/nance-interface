import { useState } from "react";

import Link from "next/link";
import dynamic from "next/dynamic";

import {
  BanknotesIcon,
  BoltIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/solid";

import { StringParam, useQueryParams } from "next-query-params";
import LoadingArrowSpiner from "@/components/common/LoadingArrowSpiner";
import { SpaceInfo } from "@/models/NanceTypes";
import { SpaceContext } from "@/context/SpaceContext";

const QueueReconfigurationModal = dynamic(
  () => import("@/components/Transaction/QueueReconfiguration"),
  {
    loading: () => <LoadingArrowSpiner />,
  },
);
const QueueTransactionsModal = dynamic(
  () => import("@/components/Transaction/QueueTransactions"),
  {
    loading: () => <LoadingArrowSpiner />,
  },
);

export default function SpaceAction({ spaceInfo }: { spaceInfo: SpaceInfo }) {
  const [showQueueReconfigurationModal, setShowQueueReconfigurationModal] =
    useState(false);
  const [showQueueTransactionsModal, setShowQueueTransactionsModal] =
    useState(false);

  const [query, setQuery] = useQueryParams({
    cycle: StringParam,
  });

  const spaceName = spaceInfo.name;
  const projectId = parseInt(spaceInfo.juiceboxProjectId || "1");
  const currentCycle = spaceInfo.currentCycle.toString();

  return (
    <div className="mt-2 flex max-w-7xl flex-col space-y-2 rounded-md bg-white p-2 shadow md:flex-row md:space-x-5 md:space-y-0">
      <Link
        id="new-proposal-button"
        href={`/s/${spaceName}/edit`}
        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:ml-2"
      >
        <DocumentTextIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        New Proposal
      </Link>

      <Link
        href={`/review?project=${projectId}`}
        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <ShieldCheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Review Reconfiguration
      </Link>

      <SpaceContext.Provider value={spaceInfo}>
        <button
          type="button"
          onClick={() => {
            setQuery({ cycle: currentCycle });
            setShowQueueReconfigurationModal(true);
          }}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <BanknotesIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Queue Reconfiguration
        </button>
        {showQueueReconfigurationModal && (
          <QueueReconfigurationModal
            open={showQueueReconfigurationModal}
            setOpen={setShowQueueReconfigurationModal}
            juiceboxProjectId={projectId}
            space={spaceName}
            currentCycle={spaceInfo.currentCycle}
          />
        )}

        <button
          type="button"
          onClick={() => {
            setQuery({ cycle: currentCycle });
            setShowQueueTransactionsModal(true);
          }}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <BoltIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Queue Transactions
        </button>
        {showQueueTransactionsModal && (
          <QueueTransactionsModal
            open={showQueueTransactionsModal}
            setOpen={setShowQueueTransactionsModal}
            transactorAddress={spaceInfo.transactorAddress!.address}
            space={spaceName}
          />
        )}

        <Link
          id="settings-button"
          href={`/s/${spaceName}/settings`}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:ml-2"
        >
          <Cog8ToothIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Settings
        </Link>
      </SpaceContext.Provider>
    </div>
  );
}
