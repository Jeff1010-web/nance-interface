import { useState, useContext } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

import SpaceHeader from "./sub/SpaceHeader";
import SpaceAction from "./sub/SpaceAction";
import CycleSelectorAndSearchBar from "./sub/CycleSelectorAndSearchBar";
import ProposalCards from "./sub/ProposalCards";
import DoltCommitInfo from "./sub/DoltCommitInfo";
import { ScrollToBottom } from "@/components/PageButton";
import { driverSteps } from "./constants/DriverSteps";
import { SpaceContext } from "@/context/SpaceContext";

const UIGuide = dynamic(() => import("@/components/common/UIGuide"), {
  ssr: false,
});

export default function Space() {
  const spaceInfo = useContext(SpaceContext);

  return (
    <div className="m-4 flex justify-center lg:m-6 lg:px-20">
      <div className="flex w-full max-w-7xl flex-col">
        <SpaceHeader />
        <SpaceAction />
        <CycleSelectorAndSearchBar currentCycle={spaceInfo?.currentCycle} />
        <ProposalCards
          space={spaceInfo?.name || ""}
          maxCycle={(spaceInfo?.currentCycle ?? 0) + 1}
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
