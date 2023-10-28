import SiteNav from "../../../components/SiteNav";
import Footer from "../../../components/Footer";
import NanceSpace from "../../../components/pages/space/NanceSpace";
import { NANCE_API_URL } from "../../../constants/Nance";
import { SpaceInfo } from '../../../models/NanceTypes';
import SpaceNotFound from '../../../components/pages/space/SpaceNotFound';

export async function getServerSideProps(context: any) {
  const spaceParam: string = context.params.space;
  const { data } = await fetch(`${NANCE_API_URL}/${spaceParam}`).then((res) => res.json());
  // Pass data to the page via props
  return {
    props: {
      spaceInfo: data || null
    }
  };
}

export default function NanceSpacePage({ spaceInfo }: { spaceInfo: SpaceInfo }) {
  const spaceImage = (!spaceInfo) ? '/images/character/Empty_Orange_2.png' : (spaceInfo.name === 'juicebox') ? '/images/opengraph/homepage.png' : `https://cdn.stamp.fyi/space/${spaceInfo.snapshotSpace}?s=500`;
  const pageTitle = (!spaceInfo) ? 'Not Found' : `${spaceInfo.name} Governance`;
  return (
    <>
      <SiteNav pageTitle={pageTitle} description={pageTitle} image={spaceImage} space={spaceInfo?.name} withWallet withProposalButton={false} />
      {!spaceInfo ? (
        <SpaceNotFound />
      ) : (
        <NanceSpace spaceInfo={spaceInfo} proposalUrlPrefix={`/s/${spaceInfo.name}/`} />
      )}
      <Footer />
    </>
  );
}
