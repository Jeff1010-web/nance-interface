import SiteNav from "../../../components/SiteNav"
import Footer from "../../../components/Footer"
import NanceSpace from "../../../components/nance/Space";

export async function getServerSideProps(context) {
  const spaceParam: string = context.params.space;

  // Pass data to the page via props
  return {
    props: {
      space: spaceParam
    }
  }
}

export default function NanceSpacePage({ space } : { space: string }) {
  return (
    <>
      <SiteNav pageTitle={`${space} Governance`} description={`${space} Governance Platform`} image="/images/opengraph/homepage.png" space={space} withWallet />
      <NanceSpace space={space} proposalUrlPrefix={`/s/${space}/`} />
      <Footer />
    </>
  )
}
