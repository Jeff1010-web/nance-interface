import Footer from "../components/Footer";
import SiteNav from "../components/SiteNav";
import Landing from "../components/pages/landing/Landing";

export default function LandingPage() {
  return (
    <>
      <SiteNav pageTitle="Nance | Automate Your Governance" withProposalButton={false} withSiteSuffixInTitle={false} />
      <Landing />
      <Footer />
    </>
  )
}
