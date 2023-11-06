import { Footer, SiteNav } from "@/components/Site";
import AllSpace from "@/components/AllSpace";

export default function NanceAllSpacePage() {
  return (
    <>
      <SiteNav
        pageTitle="All Spaces"
        description="All spaces created and hosted on Nance platform."
        image={`https://cdn.stamp.fyi/space/jbdao.eth?w=1200&h=630`}
        withWallet
        withProposalButton={false}
      />
      <AllSpace />
      <Footer />
    </>
  );
}
