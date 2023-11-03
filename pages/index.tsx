import { Footer, SiteNav } from "@/components/Site";
import Landing from "@/components/Landing";

export default function LandingPage() {
  return (
    <>
      <SiteNav
        pageTitle="Nance | Automate Your Governance"
        withProposalButton={false}
        withSiteSuffixInTitle={false}
      />
      <Landing />
      <Footer />
    </>
  );
}
