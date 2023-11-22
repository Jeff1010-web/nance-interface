import { useState } from "react";
import { usePrivateProposals } from "@/utils/hooks/NanceHooks";
import dynamic from "next/dynamic";
import { SpaceInfo } from "@/models/NanceTypes";
import { useSession } from "next-auth/react";

import SpaceHeader from "./sub/SpaceHeader";
import SpaceAction from "./sub/SpaceAction";
import CycleSelectorAndSearchBar from "./sub/CycleSelectorAndSearchBar";
import ProposalCards from "./sub/ProposalCards";
import DoltCommitInfo from "./sub/DoltCommitInfo";
import { ScrollToBottom } from "@/components/PageButton";
import { driverSteps } from "./constants/DriverSteps";

const UIGuide = dynamic(() => import("@/components/common/UIGuide"), {
  ssr: false,
});

export default function Space({
  spaceInfo,
  proposalUrlPrefix = "/p/",
}: {
  spaceInfo: SpaceInfo;
  proposalUrlPrefix?: string;
}) {
  // State
  const [showDrafts, setShowDrafts] = useState(true);

  // External Hooks
  const { data: session } = useSession();
  const isAddressConnected = !!session?.user?.name;
  const { data: privateProposals, isLoading } = usePrivateProposals(
    spaceInfo.name,
    isAddressConnected
  );

  return (
    <div className="m-4 flex justify-center lg:m-6 lg:px-20">
      <div className="flex w-full max-w-7xl flex-col">
        {spaceInfo && (
          <>
            <SpaceHeader spaceInfo={spaceInfo} />
            <SpaceAction spaceInfo={spaceInfo} />
          </>
        )}
        <CycleSelectorAndSearchBar
          showDrafts={showDrafts}
          setShowDrafts={setShowDrafts}
          hasDrafts={(privateProposals?.data?.length ?? 0) > 0}
          currentCycle={spaceInfo?.currentCycle}
        />
        <ProposalCards
          proposalUrlPrefix={proposalUrlPrefix}
          loading={isLoading}
          space={spaceInfo.name}
          privateProposals={privateProposals?.data}
          maxCycle={(spaceInfo.currentCycle ?? 0) + 1}
          showDrafts={showDrafts}
        />
        {spaceInfo?.dolthubLink && (
          <DoltCommitInfo dolthubLink={spaceInfo.dolthubLink} />
        )}

        <UIGuide name="SpacePage" steps={driverSteps} />
        <ScrollToBottom />
      </div>
    </div>
  );
}
