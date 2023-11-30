import { useState, useContext } from "react";

import dynamic from "next/dynamic";

import {
  BanknotesIcon,
  BoltIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/solid";
import { PhoneIcon, PlayCircleIcon } from "@heroicons/react/20/solid";

import { StringParam, useQueryParams } from "next-query-params";
import LoadingArrowSpiner from "@/components/common/LoadingArrowSpiner";
import { SpaceContext } from "@/context/SpaceContext";
import FlyoutMenu from "@/components/FlyoutMenu/FlyoutMenu";
import useLocalStorage from "@/utils/hooks/LocalStorage";
import { GuideRecord } from "@/components/common/UIGuide";
import { UIGUIDE_SPACE_NAME } from "../constants/DriverSteps";
import { useRouter } from "next/router";
import Link from "next/link";

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

export default function SpaceAction() {
  const [showQueueReconfigurationModal, setShowQueueReconfigurationModal] =
    useState(false);
  const [showQueueTransactionsModal, setShowQueueTransactionsModal] =
    useState(false);

  const router = useRouter();
  const [spaceGuide, setSpaceGuide] = useLocalStorage<GuideRecord>(
    `UIGuide-${UIGUIDE_SPACE_NAME}`,
    1,
    {
      shouldOpen: true,
      version: 1,
    },
  );

  const [query, setQuery] = useQueryParams({
    cycle: StringParam,
  });

  const spaceInfo = useContext(SpaceContext);

  if (!spaceInfo) {
    return null;
  }

  const spaceName = spaceInfo.name;
  const projectId = parseInt(spaceInfo.juiceboxProjectId || "1");
  const currentCycle = spaceInfo.currentCycle.toString();

  return (
    <div className="flex space-x-4">
      <Link
        id="new-proposal-button"
        href={`/s/${spaceName}/edit`}
        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:ml-2"
      >
        <DocumentTextIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Propose
      </Link>

      <div id="advanced-actions">
        <FlyoutMenu
          label="Advanced"
          overridePanelClassName="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4"
          entries={[
            {
              name: "Settings",
              description: "Change your space settings.",
              href: `/s/${spaceName}/settings`,
              icon: Cog8ToothIcon,
            },
            {
              name: "Review Reconfiguration",
              description: "Review the reconfiguration queued in your Safe.",
              href: `/review?project=${projectId}`,
              icon: ShieldCheckIcon,
            },
            {
              name: "Queue Reconfiguration",
              description:
                "Queue a reconfiguration based on governance results and submit it to Safe.",
              href: "#",
              icon: BanknotesIcon,
              onClick: () => {
                setQuery({ cycle: currentCycle });
                setShowQueueReconfigurationModal(true);
              },
            },
            {
              name: "Queue Transactions",
              description:
                "Queue transactions based on governance results and submit it to Safe.",
              href: "#",
              icon: BoltIcon,
              onClick: () => {
                setQuery({ cycle: currentCycle });
                setShowQueueTransactionsModal(true);
              },
            },
          ]}
          callToActions={[
            {
              name: "Watch demo",
              href: "#",
              icon: PlayCircleIcon,
              onClick: () => {
                setSpaceGuide({
                  shouldOpen: true,
                  version: 1,
                });
                router.reload();
              },
            },
            {
              name: "Contact us",
              href: "discord://discord.com/channels/1090064637858414633/1090064925923221555",
              icon: PhoneIcon,
            },
          ]}
        />
      </div>

      {showQueueReconfigurationModal && (
        <QueueReconfigurationModal
          open={showQueueReconfigurationModal}
          setOpen={setShowQueueReconfigurationModal}
          juiceboxProjectId={projectId}
          space={spaceName}
          currentCycle={spaceInfo.currentCycle}
        />
      )}

      {showQueueTransactionsModal && (
        <QueueTransactionsModal
          open={showQueueTransactionsModal}
          setOpen={setShowQueueTransactionsModal}
          transactorAddress={spaceInfo.transactorAddress!.address}
          space={spaceName}
        />
      )}
    </div>
  );
}
