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
  const { data, isLoading } = useSpaceInfo({ space });
  const spaceImage = data?.data?.name === 'juicebox' ? '/images/opengraph/homepage.png' : `https://cdn.stamp.fyi/space/${data?.data?.snapshotSpace}?s=500`;
  if (isLoading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="animate-spin inline-block w-20 h-20 border-[5px] border-current border-t-transparent text-gray-900 rounded-full mr-2" role="status" aria-label="loading" />
      </div>
    );
  }
  return (
    <>
      <SiteNav pageTitle={`${space} Governance`} description={`${space} Governance Platform`} image={spaceImage} space={space} withWallet withProposalButton={false} />
      <NanceSpace space={space} proposalUrlPrefix={`/s/${space}/`} />
      <Footer />
    </>
  );
}
