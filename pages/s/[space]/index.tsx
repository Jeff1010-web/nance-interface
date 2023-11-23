import ContentNotFound from "@/components/ContentNotFound";
import { Footer, SiteNav } from "@/components/Site";
import Space from "@/components/Space";

import { NANCE_API_URL } from "@/constants/Nance";
import { SpaceContext } from "@/context/SpaceContext";
import { SpaceInfo } from "@/models/NanceTypes";

export async function getServerSideProps(context: any) {
  const spaceParam: string = context.params.space;
  const { data } = await fetch(`${NANCE_API_URL}/${spaceParam}`).then((res) =>
    res.json(),
  );
  // Pass data to the page via props
  return {
    props: {
      spaceInfo: data || null,
    },
  };
}

const SPACE_NOT_FOUND_IMAGE = "/images/character/Empty_Orange_2.png";
const JBDAO_OPENGRAPH_IMAGE = "/images/opengraph/homepage.png";

export default function SpacePage({ spaceInfo }: { spaceInfo: SpaceInfo }) {
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

  return (
    <>
      <SiteNav
        pageTitle={pageTitle}
        description={pageTitle}
        image={spaceImage}
        space={name}
        withWallet
        withProposalButton={false}
      />

      <SpaceContext.Provider value={spaceInfo}>
        <Space />
      </SpaceContext.Provider>

      <Footer />
    </>
  );
}
