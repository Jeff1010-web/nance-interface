import SiteNav from "../../../components/SiteNav";
import Footer from "../../../components/Footer";
import NanceSpace from "../../../components/nance/Space";
import { useSpaceInfo } from "../../../hooks/NanceHooks";
import { useRouter } from "next/router";

export async function getServerSideProps(context: any) {
  const spaceParam: string = context.params.space;

  // Pass data to the page via props
  return {
    props: {
      space: spaceParam
    }
  };
}

export default function NanceSpacePage({ space } : { space: string }) {
  const router = useRouter();
  const { data } = useSpaceInfo({ space }, router.isReady);
  const spaceImage = data?.data?.name === 'juicebox' ? '/images/opengraph/homepage.png' : `https://cdn.stamp.fyi/space/${data?.data?.snapshotSpace}?s=500`;
  return (
    <>
      <SiteNav pageTitle={`${space} Governance`} description={`${space} Governance Platform`} image={spaceImage} space={space} withWallet withProposalButton={false} />
      <NanceSpace space={space} proposalUrlPrefix={`/s/${space}/`} />
      <Footer />
    </>
  );
}
