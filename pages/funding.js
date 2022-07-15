import Layout from "../components/Layout"

export default function Funding() {
    return (
        <Layout>
            <div className="bg-grey-lightest border-b">
                <div className="xs:py-8 xs:px-8 md:px-4 lg:px-0 sm:py-12 sm:pt-6 sm:max-w-3xl m-auto">
                    <div className="text-4xl text-nouns pb-6 tracking-wide">
                        Funding: Proposals
                    </div>
                    <div className="sm:flex sm:items-center ">
                        <div className="sm:flex-auto mb-4">
                            <p className="text-md font-medium mt-4">Resources allocated for the Juicebox ecosystems.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative sm:py-6">
                <div className="relative max-w-7xl mx-auto">
                    <div className="xs:mt-6 sm:mt-0 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
                        <FundedProjectCard
                            coverImg="https://s3-us-west-2.amazonaws.com/anchor-generated-image-bank/production/podcast_uploaded_nologo400/20172808/20172808-1639932274124-70f0c914e9d5f.jpg"
                            title="Produce Juicebox Podcast"
                            description="This podcast and Twitter AMA would serve to bring the Juicebox protocol to a wider audience, both through distribution on social media and increased public understanding of the Juicebox protocol and DAO concepts."
                            link="https://snapshot.org/#/jbdao.eth/proposal/0x464fd6f32b52dbf64648e07e041d57dd547bcafad35471cc03d4736b73dcc610"
                            author="filipv"
                            authorImg="https://pbs.twimg.com/profile_images/1531517308103012352/VLNKDxeQ_400x400.jpg"
                            authorTwitter="https://twitter.com/filipv_"
                            date="Nov 27, 2021" />
                        <FundedProjectCard 
                            coverImg="https://pbs.twimg.com/media/FWeRnlaUcAA7AMV?format=jpg&name=medium"
                            title="On Going Metaverse Curation"
                            description="The Juicebox Lounge has become an exciting and unique voxel experience that has been featured internationally linking Juicebox to the forefront of metaverse marketing & web3 grassroots community building campaigns."
                            link="https://snapshot.org/#/jbdao.eth/proposal/0x295800c868aab1a2d51d9ffb23777e20e52cab4b9894f7dd6a946bfbc85af970"
                            author="Lexicon_devils"
                            authorImg="https://pbs.twimg.com/profile_images/1512398138962763787/6M7lgMbx_400x400.jpg"
                            authorTwitter="https://twitter.com/devils_lexicon"
                            date="Apr 21, 2022" />
                        <FundedProjectCard 
                            coverImg="https://pbs.twimg.com/media/FVn_15QWQAA6jnW?format=jpg&name=medium"
                            title="JB + Morgenstern"
                            description="Allot $30,000USD to partner with Morgenstern’s Finest Ice Cream (MNYC) during NFT NYC (June 20-22) to entice, invite, and introduce project builders and dream seekers to learn about JB Protocol and make dreams f-ing come true …and dish out free ice cream!"
                            link="https://snapshot.org/#/jbdao.eth/proposal/0x0756b732facd8cdaec272bb7495f36ad070d3e53a952d6eba23284123ff5e5e2"
                            author="Zom BaΞ"
                            authorImg="https://pbs.twimg.com/profile_images/1459252874056249351/vx9dpRpp_400x400.jpg"
                            authorTwitter="https://twitter.com/Zom_Bae_"
                            date="May 19, 2022" />
                        <FundedProjectCard 
                            coverImg="https://pbs.twimg.com/profile_banners/1519446727744446464/1657046240/1500x500"
                            title="DAO NYC Sponsorship"
                            description="DAO NYC will be the flagship DAO Event in New York, a conference for DAO’s by DAO’s to talk and learn...about DAO’s. This proposal is to request that JuiceBox DAO to attend and sponsor the event."
                            link="https://snapshot.org/#/jbdao.eth/proposal/0x34afb90b7c1f48c432c5aab07c13da1326adcc0c4344db3bd2c2d15705c44e68"
                            author="Dennison Bertram"
                            authorImg="https://pbs.twimg.com/profile_images/1524798074962464769/CHKnFgnm_400x400.png"
                            authorTwitter="https://twitter.com/DennisonBertram"
                            date="May 24, 2022" />
                        <FundedProjectCard 
                            coverImg="https://buidlguidl.com/assets/bg_castle.png"
                            title="Buidl Guidl x Juicebox Hackathon"
                            description="The goal of this proposal is to encourage members of this builder community to become familiar with Juicebox v2 through their favorite activities: building and experimentation on the blockchain!"
                            link="https://snapshot.org/#/jbdao.eth/proposal/0x389d186c61410bd6f58ae48ed34237d8281693962337a333033df9e0ea427903"
                            author="Nicholas"
                            authorImg="https://pbs.twimg.com/profile_images/1542953010841751553/jCoPnh6L_400x400.png"
                            authorTwitter="https://twitter.com/nnnnicholas"
                            date="June 3, 2022" />
                        <FundedProjectCard 
                            coverImg="https://www.jokedao.io/home@1440.jpg"
                            title="Sponsor Development of jokedao v2"
                            description="DAO governance *can* be fun, and jokedao has created the platform to enable that."
                            link="https://snapshot.org/#/jbdao.eth/proposal/0xecb6ba5ca205acb63cb430d6e94cb48e8b0ff8f1e83a0d1478d35f729ab1532f"
                            author="Sean McCaffery"
                            authorImg="https://pbs.twimg.com/profile_images/1466416676753350659/c2chDfnz_400x400.jpg"
                            authorTwitter="https://twitter.com/seanmc_eth"
                            date="June 16, 2022" />
                    </div>
                </div>
            </div>
        </Layout>
    )
}

function FundedProjectCard({ coverImg, title, description, link, author, authorImg, authorTwitter, date }) {
    return (
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
            <div className="flex-shrink-0">
                <a href={link} target="_blank" rel="noreferrer">
                    <img className="h-48 w-full object-cover" src={coverImg} alt="" />
                </a>
            </div>
            <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                <div className="flex-1">
                    <a href={link} target="_blank" rel="noreferrer" className="block mt-2">
                        <p className="text-xl text-nouns tracking-wide text-gray-900">{title}</p>
                        <p className="mt-3 text-base text-gray-500">{description}</p>
                    </a>
                </div>
                <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                        <a href={authorTwitter || "https://twitter.com/juiceboxETH"} target="_blank" rel="noreferrer">
                            <span className="sr-only">{author}</span>
                            <img className="h-10 w-10 rounded-full" src={authorImg || "https://pbs.twimg.com/profile_images/1439973770643443714/GW7Vf9qj_400x400.png"} alt={title} />
                        </a>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                            <a href={authorTwitter || "https://twitter.com/juiceboxETH"} target="_blank" rel="noreferrer">{author}</a>
                        </p>
                        <div className="flex space-x-1 text-sm text-gray-500">{date}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}