import SiteNav from "../components/SiteNav";

export default function DemoPage() {
    return (
        <>
            <SiteNav pageTitle="Demo page" description="JuiceboxDAO Governance Platform" image="/images/opengraph/homepage.png" withWallet withProposalButton={false} />

            <div className="mt-12"></div>
        </>
    )
}