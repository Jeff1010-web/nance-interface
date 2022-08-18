import { PropsWithChildren } from 'react';
import SiteNav from '../components/SiteNav';

export default function Progress() {
    return (
        <>
            <SiteNav pageTitle="Progress" currentIndex={1} />
            <div className="relative sm:py-12 border-b">
                <div className="relative max-w-7xl mx-auto">
                    <div className="xs:mt-6 sm:mt-0 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
                        <FeatureProgressCard 
                            coverImg="/images/feature/v1v2_migration.jpg"
                            title="V1V2 Migration"
                            description="Holders may exchange v1 project token for v2 project token if the project owners configured to allow this."
                            link="https://github.com/jbx-protocol/juice-v1-token-payment-terminal"
                            status="Under Review" />
                        <FeatureProgressCard 
                            coverImg="/images/feature/nft_rewards.jpg"
                            title="NFT Rewards"
                            description="Reward contributors with NFTs when they meet your configured funding criteria."
                            link="https://github.com/jbx-protocol/juice-interface/pull/1356"
                            status="Under Review" />
                        <FeatureProgressCard 
                            coverImg="/images/feature/vebanny.png"
                            title="veBanny Staking"
                            description="Allows project owners to specify the v1 project token that they are willing to accept from holders in exchange for their v2 project token."
                            link="https://github.com/jbx-protocol/juice-interface/pull/1367"
                            status="Under Review" />
                    </div>
                </div>
            </div>
            <div className="relative sm:py-12">
                <div className="relative max-w-7xl mx-auto">
                    <p className="text-3xl font-medium mb-8">
                        Released Features
                    </p>
                    <div className="xs:mt-6 sm:mt-0 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
                        <FeatureCard 
                            coverImg="/images/feature/handle.jpeg"
                            title="V2 ENS Handle"
                            description="Choose an ENS name to use as the project's handle. Subdomains are allowed and will be included in the handle. Handles won't include the '.eth' extension."
                            date="Jul 6, 2022"
                            link="https://twitter.com/peripheralist/status/1544376189850107909" />
                        <FeatureCard 
                            coverImg="/images/feature/sticker.jpg"
                            title="Banny Sticker"
                            description="Quick attach a Banny to your next contribution on Juicebox."
                            date="Jun 14, 2022"
                            link="https://twitter.com/JohnnyD_eth/status/1536600334507843586" />
                        <FeatureCard 
                            coverImg="/images/feature/v2_compatible.jpg"
                            title="V2 Compatible Interface"
                            description="http://juicebox.money is now compatible with juicebox v2 contracts."
                            date="May 12, 2022"
                            link="https://twitter.com/peripheralist/status/1524526981806759941" />
                        <FeatureCard 
                            coverImg="/images/feature/payable_address.jpg"
                            title="Payable Address"
                            description="Create an Ethereum address that can be used to pay your project directly."
                            date="May 2, 2022"
                            link="https://twitter.com/JohnnyD_eth/status/1520844430139432961" />
                    </div>
                </div>
            </div>
        </>
    )
}

function FeatureCard({ children, coverImg, title, description, link, date }: PropsWithChildren<any>) {
    return (
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
            <div className="flex-shrink-0">
                <a href={link} target="_blank" rel="noreferrer">
                    <img className="h-48 w-full object-cover" src={coverImg} alt="" />
                </a>
            </div>
            <div className="flex-1 bg-white p-4 flex flex-col justify-between">
                {children}
                <div className="flex-1 pt-1">
                    <a href={link} target="_blank" rel="noreferrer" className="block mt-2">
                        <p className="text-xl tracking-wide text-gray-900">{title}</p>
                        <p className="flex space-x-1 text-sm text-gray-500">{date}</p>
                        <p className="mt-3 text-base text-gray-500">{description}</p>
                    </a>
                </div>
            </div>
        </div>
    )
}

function FeatureProgressCard({ coverImg, title, description, link, status }) {
    return (
        <FeatureCard 
            coverImg={coverImg}
            title={title}
            description={description}
            link={link}>
            <div className="mb-1 flex items-center">
                <p className={`flex-auto ${status === "Prototype" ? "text-green-500" : "text-gray-300"} `}>Prototype</p>
                <p className={`flex-auto ${status === "In Progress" ? "text-green-500" : "text-gray-300"} `}>In Progress</p>
                <p className={`flex-auto ${status === "Under Review" ? "text-green-500" : "text-gray-300"} `}>Under Review</p>
            </div>
            <div className="mt-1 flex items-center">
                {
                    (() => {
                        let val = "0";
                        switch (status) {
                            case "Prototype":
                                val = "8";
                                break;
                            case "In Progress":
                                val = "40";
                                break;
                            case "Under Review":
                                val = "80";
                                break;
                        }
                        return (
                            <input type="range" min="0" max="100" disabled className="w-full" value={val} />
                        )
                    })()
                }
            </div>
        </FeatureCard>
    )
}