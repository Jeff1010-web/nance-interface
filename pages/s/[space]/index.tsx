import SiteNav from "../../../components/SiteNav";
import Footer from "../../../components/Footer";
import NanceSpace from "../../../components/nance/Space";
import { NANCE_API_URL } from "../../../constants/Nance";

export async function getServerSideProps(context: any) {
  const spaceParam: string = context.params.space;
  const { data } = await fetch(`${NANCE_API_URL}/${spaceParam}`).then((res) => res.json());
  // Pass data to the page via props
  return {
    props: {
      space: spaceParam,
      snapshotSpace: data.snapshotSpace,
    }
  };
}

export default function NanceSpacePage({ space, snapshotSpace } : { space: string, snapshotSpace: string }) {
  const spaceImage = (space === 'juicebox') ? '/images/opengraph/homepage.png' : `https://cdn.stamp.fyi/space/${snapshotSpace}?s=500`;
  return (
    <>
      <SiteNav pageTitle={`${space} Governance`} description={`${space} Governance Platform`} image={spaceImage} space={space} withWallet withProposalButton={false} />
      <NanceSpace space={space} proposalUrlPrefix={`/s/${space}/`} />
      <Footer />
    </>
  );
}
