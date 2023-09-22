import { useQueryParams, StringParam, withDefault, BooleanParam, NumberParam } from "next-query-params";
import { useRouter } from "next/router";
import { useLayoutEffect, useState } from "react";
import { useSpaceInfo, useProposals } from "../../../hooks/NanceHooks";
import ScrollToBottom from "../../ScrollToBottom";
import ProposalCards from "./ProposalCards";
import { getLastSlash } from "../../../libs/nance";
import Pagination from "../../Pagination";
import { BanknotesIcon, BoltIcon, DocumentTextIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import dynamic from "next/dynamic";
import LoadingArrowSpiner from "../../LoadingArrowSpiner";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import CycleSelectorAndSearchBar from "./CycleSelectorAndSearchBar";
import SpaceHeader from "./SpaceHeader";

const QueueExecutionModal = dynamic(() => import("./QueueReconfigurationModal"), {
  loading: () => <LoadingArrowSpiner />,
});
const QueueTransactionsModal = dynamic(() => import("./QueueTransactionsModal"), {
  loading: () => <LoadingArrowSpiner />,
});

function getDriver(action: () => void) {
  const driverObj = driver({
    showProgress: true,
    steps: [
      {
        element: "#new-proposal-button",
        popover: {
          title: "Create new proposal",
          description: "You can request payouts, reserve tokens and custom transactions.",
          side: "left", align: 'start'
        },
      },
      {
        element: "#cycle-select-box",
        popover: {
          title: "Select the cycle",
          description: "Proposals are grouped by cycles, you can select the cycle you want to view.",
          side: "top", align: 'start'
        },
      },
      {
        element: "#search-bar",
        popover: {
          title: "Search proposals with keywords",
          description: "You can search proposals with keywords, which can be the words in the title or the content. Use space to separate multiple keywords.",
          side: "bottom", align: 'start'
        },
      },
      {
        element: "#proposals-table",
        popover: {
          title: "View proposals",
          description: "All proposals are listed here. You can view the details of each proposal by clicking the proposal.",
          side: "top", align: 'start'
        },
      },
      {
        element: "#proposals-table-head",
        popover: {
          title: "Sort proposals",
          description: "You can sort proposals by clicking the table headers. And to reverse the order, just click again.",
          side: "bottom", align: 'start'
        },
      },
      {
        element: "#pagination-div",
        popover: {
          title: "Check other pages",
          description: "You can check other pages by clicking the left or right arrow.",
          side: "top", align: 'start'
        },
      },
    ],
    onDestroyStarted: () => {
      if (!driverObj.hasNextStep() || confirm("Are you sure?")) {
        driverObj.destroy();
        action();
      }
    },
  });

  return driverObj;
}

export default function NanceSpace({ space, proposalUrlPrefix = "/p/" }: { space: string, proposalUrlPrefix?: string }) {
  // State
  const [showDrafts, setShowDrafts] = useState(true);
  const [showQueueReconfigurationModal, setShowQueueReconfigurationModal] = useState(false);
  const [showQueueTransactionsModal, setShowQueueTransactionsModal] = useState(false);

  // QueryParams
  const router = useRouter();
  const [query, setQuery] = useQueryParams({
    keyword: StringParam,
    limit: withDefault(NumberParam, 20),
    page: withDefault(NumberParam, 1),
    cycle: StringParam,
    guide: withDefault(BooleanParam, false)
  });
  const { keyword, cycle, limit, page } = query;

  // External Hooks
  const { data: infoData, isLoading: infoLoading, error: infoError } = useSpaceInfo({ space }, router.isReady);
  const { data: proposalData, isLoading: proposalsLoading, error: proposalError } = useProposals({ space, cycle, keyword, page, limit }, router.isReady);
  const loading = infoLoading || proposalsLoading;

  const projectId = parseInt(infoData?.data?.juiceboxProjectId || "1");

  useLayoutEffect(() => {
    if (query.guide && !loading) {
      getDriver(() => setQuery({ guide: false })).drive();
    }
  }, [query.guide, loading, setQuery]);

  return (
    <div className="m-4 lg:m-6 flex justify-center lg:px-20">
      <div className="flex flex-col max-w-7xl w-full">

        <SpaceHeader spaceInfo={infoData?.data} />

        <div className="max-w-7xl flex flex-col space-y-2 md:flex-row md:space-x-5 md:space-y-0 bg-white mt-2 p-2 shadow rounded-md">
          <Link
            id="new-proposal-button"
            href={`/s/${space}/edit`}
            className="md:ml-2 inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <DocumentTextIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            New Proposal
          </Link>

          <button
            type="button"
            onClick={() => {
              setQuery({ cycle: infoData?.data?.currentCycle.toString() });
              setShowQueueReconfigurationModal(true);
            }}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BanknotesIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Queue Reconfiguration
          </button>
          {showQueueReconfigurationModal && <QueueExecutionModal open={showQueueReconfigurationModal} setOpen={setShowQueueReconfigurationModal} juiceboxProjectId={projectId} proposals={proposalData?.data} space={space} currentCycle={infoData?.data?.currentCycle} />}

          <button
            type="button"
            onClick={() => {
              setQuery({ cycle: infoData?.data?.currentCycle.toString() });
              setShowQueueTransactionsModal(true);
            }}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BoltIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Queue Transactions
          </button>
          {showQueueTransactionsModal && <QueueTransactionsModal open={showQueueTransactionsModal} setOpen={setShowQueueTransactionsModal} juiceboxProjectId={projectId} proposals={proposalData?.data} space={space} />}

          <Link
            href={`/review?project=${projectId}`}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <ShieldCheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Review Reconfiguration
          </Link>

        </div>

        <CycleSelectorAndSearchBar
          showDrafts={showDrafts} setShowDrafts={setShowDrafts}
          hasDrafts={(proposalData?.data?.privateProposals?.length ?? 0) > 0} currentCycle={infoData?.data?.currentCycle} />

        <div>
          <ProposalCards proposalUrlPrefix={proposalUrlPrefix} loading={loading} proposalsPacket={proposalData?.data} maxCycle={(infoData?.data?.currentCycle ?? 0) + 1} showDrafts={showDrafts} />
        </div>

        <Pagination page={page} setPage={(p) => setQuery({ page: p })} limit={limit} total={0} infinite />

        <div className="mt-2 text-center">
          {infoData?.data?.dolthubLink && (
            <p className="text-center text-xs text-gray-500">
              ∴ dolt commit <a href={infoData?.data?.dolthubLink} target="_blank" rel="noopener noreferrer">{getLastSlash(infoData?.data?.dolthubLink)?.slice(0, 7)}</a>
            </p>
          )}
        </div>

        <ScrollToBottom />
      </div>
    </div>
  );
}
