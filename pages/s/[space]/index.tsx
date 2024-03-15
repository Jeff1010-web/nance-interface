import ContentNotFound from "@/components/ContentNotFound";
import { Footer, SiteNav } from "@/components/Site";
import Space from "@/components/Space";
import { calculateRemainingTime } from "@/components/Space/sub/SpaceHeader";

import { SpaceContext } from "@/context/SpaceContext";
import { useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { useParams } from "next/navigation";

const SPACE_NOT_FOUND_IMAGE = "/images/character/Empty_Orange_2.png";
const JBDAO_OPENGRAPH_IMAGE = "/images/opengraph/homepage.png";

export default function SpacePage() {
  const params = useParams<{ space: string }>();
  const space = params?.space;
  const { data, isLoading } = useSpaceInfo({ space }, !!space );
  const spaceInfo = data?.data;

  if (isLoading || !space) {
    return (
      <>
        <SiteNav
          pageTitle="Loading"
          description="Loading space"
          withProposalButton={false}
        />
      </>
    );
  }

  if (!spaceInfo) {
    return (
      <>
        <SiteNav
          pageTitle="Not Found"
          description="Space not found"
          image={SPACE_NOT_FOUND_IMAGE}
          withProposalButton={false}
        />
        <ContentNotFound
          title="Space Not Found"
          reason="The space you are looking for does not exist."
          recommendationText="Do you want to create a new space?"
          recommendationActionHref="/create"
          recommendationActionText="Create Space"
          fallbackActionHref="/s"
          fallbackActionText="See All Spaces"
        />
        <Footer />
      </>
    );
  }

  const { name, snapshotSpace } = spaceInfo;
  const spaceImage =
    name === "juicebox"
      ? JBDAO_OPENGRAPH_IMAGE
      : `https://cdn.stamp.fyi/space/${snapshotSpace}?s=500`;
  const pageTitle = `${spaceInfo.name} Governance`;

  const { formattedEndTime } = calculateRemainingTime(
    spaceInfo.currentEvent?.end ?? "",
  );

  return (
    <>
      <SiteNav
        pageTitle={pageTitle}
        description={pageTitle}
        image={spaceImage}
        space={name}
        withWallet
        withProposalButton={false}
        mobileHeaderCenter={
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {spaceInfo.currentEvent?.title || "Unknown"} of GC
              {spaceInfo.currentCycle}
            </p>
            <p className="text-sm">Ends {formattedEndTime}</p>
          </div>
        }
      />

      <SpaceContext.Provider value={spaceInfo}>
        <Space />
      </SpaceContext.Provider>

      <Footer />
    </>
  );
}
