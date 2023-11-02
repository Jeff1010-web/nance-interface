import { useEffect, useState } from "react";
import { usePrivateProposals } from "../../../utils/hooks/NanceHooks";
import ScrollToBottom from "../../ScrollToBottom";
import ProposalCards from "./ProposalCards";
import CycleSelectorAndSearchBar from "./CycleSelectorAndSearchBar";
import SpaceHeader from "./SpaceHeader";
import { useSession } from "next-auth/react";
import SpaceAction from "./SpaceAction";
import DoltCommitInfo from "./DoltCommitInfo";
import { driverSteps } from './GuideSteps';
import dynamic from 'next/dynamic';
import { SpaceInfo } from '../../../models/NanceTypes';

const UIGuide = dynamic(() => import('../../modal/UIGuide'), { ssr: false });

export default function NanceSpace({ spaceInfo, proposalUrlPrefix = "/p/" }: { spaceInfo: SpaceInfo, proposalUrlPrefix?: string }) {
  // State
  const [showDrafts, setShowDrafts] = useState(true);

  // External Hooks
  const { data: sessionData } = useSession();
  const { data: privateProposals, mutate, isLoading } = usePrivateProposals(spaceInfo.name);

  useEffect(() => {
    console.debug("session change", sessionData);
    mutate();
  }, [sessionData?.user?.name, mutate]);

  return (
    <div className="m-4 lg:m-6 flex justify-center lg:px-20">
      <div className="flex flex-col max-w-7xl w-full">

        {spaceInfo && (
          <>
            <SpaceHeader spaceInfo={spaceInfo} />
            <SpaceAction spaceInfo={spaceInfo} />
          </>
        )}
        <CycleSelectorAndSearchBar
          showDrafts={showDrafts} setShowDrafts={setShowDrafts}
          hasDrafts={(privateProposals?.data?.length ?? 0) > 0} currentCycle={spaceInfo?.currentCycle} />
        <ProposalCards proposalUrlPrefix={proposalUrlPrefix} loading={isLoading} space={spaceInfo.name} privateProposals={privateProposals?.data} maxCycle={(spaceInfo.currentCycle ?? 0) + 1} showDrafts={showDrafts} />
        {spaceInfo?.dolthubLink && <DoltCommitInfo dolthubLink={spaceInfo.dolthubLink} />}

        <UIGuide name="SpacePage" steps={driverSteps} />
        <ScrollToBottom />
      </div>
    </div>
  );
}
