import { useEffect, useState } from "react";
import { useSpaceInfo, usePrivateProposals } from "../../../hooks/NanceHooks";
import ScrollToBottom from "../../ScrollToBottom";
import ProposalCards from "./ProposalCards";
import CycleSelectorAndSearchBar from "./CycleSelectorAndSearchBar";
import SpaceHeader from "./SpaceHeader";
import { DriveStep } from "driver.js";
import UIGuide from "../../modal/UIGuide";
import { useSession } from "next-auth/react";
import SpaceAction from "./SpaceAction";
import DoltCommitInfo from "./DoltCommitInfo";

const driverSteps: DriveStep[] = [
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
];

export default function NanceSpace({ space, proposalUrlPrefix = "/p/" }: { space: string, proposalUrlPrefix?: string }) {
  // State
  const [showDrafts, setShowDrafts] = useState(true);

  // External Hooks
  const { data: sessionData } = useSession();
  const { data: infoData, isLoading: loading } = useSpaceInfo({ space });
  const { data: privateProposals, mutate } = usePrivateProposals(space);

  useEffect(() => {
    console.debug("session change", sessionData);
    mutate();
  }, [sessionData?.user?.name, mutate])

  return (
    <div className="m-4 lg:m-6 flex justify-center lg:px-20">
      <div className="flex flex-col max-w-7xl w-full">

        {infoData?.data && (
          <>
            <SpaceHeader spaceInfo={infoData.data} />
            <SpaceAction spaceInfo={infoData.data} />
          </>
        )}
        <CycleSelectorAndSearchBar
          showDrafts={showDrafts} setShowDrafts={setShowDrafts}
          hasDrafts={(privateProposals?.data?.length ?? 0) > 0} currentCycle={infoData?.data?.currentCycle} />
        <ProposalCards proposalUrlPrefix={proposalUrlPrefix} loading={loading} space={space} privateProposals={privateProposals?.data} maxCycle={(infoData?.data?.currentCycle ?? 0) + 1} showDrafts={showDrafts} />
        {infoData?.data?.dolthubLink && <DoltCommitInfo dolthubLink={infoData.data.dolthubLink} />}

        <UIGuide name="SpacePage" steps={driverSteps} />
        <ScrollToBottom />
      </div>
    </div>
  );
}
