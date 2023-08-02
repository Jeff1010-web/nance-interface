import SiteNav from "../../../components/SiteNav";
import Footer from "../../../components/Footer";
import NanceSpace from "../../../components/nance/Space";
import { useSpaceInfo } from "../../../hooks/NanceHooks";

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
  const { data, error } = useSpaceInfo({ space });

  return (
    <>
      <SiteNav pageTitle={`${space} Governance`} description={`${space} Governance Platform`} image={`https://cdn.stamp.fyi/space/${data?.data.snapshotSpace}?s=500`} space={space} withWallet withProposalButton={false} />
      <NanceSpace space={space} proposalUrlPrefix={`/s/${space}/`} />
      <Footer />
    </>
  );
}
