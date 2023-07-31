import SiteNav from "../components/SiteNav";

import { NANCE_DEFAULT_SPACE } from "../constants/Nance";

import Footer from "../components/Footer";
import NanceSpace from "../components/nance/Space";

export default function NanceProposals() {
  let space = NANCE_DEFAULT_SPACE;

  return (
    <>
      <SiteNav pageTitle="JuiceboxDAO Governance" description="JuiceboxDAO Governance Platform" image="/images/opengraph/homepage.png" withWallet withProposalButton={false} />
      <NanceSpace space={space} />
      <Footer />
    </>
  );
}