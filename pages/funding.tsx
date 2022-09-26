import PostCards, { PostCard } from "../components/PostCards"
import SiteNav from "../components/SiteNav"

export default function Funding() {
    const totalProject = posts.length;
    const totalUsd = posts.map(p => p?.cost ?? 0).reduce((a, b) => a+b, 0);

    return (
        <>
            <SiteNav pageTitle="Funding" description="Projects funded by JuiceboxDAO" image="/images/banny_tutorial.png" />
            <div className="relative bg-gray-50 px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
                <div className="absolute inset-0">
                    <div className="h-1/3 bg-white sm:h-2/3" />
                </div>
                <div className="relative mx-auto max-w-7xl">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Projects funded by JuiceboxDAO</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
                            <span className="font-semibold">{totalProject} projects</span> funded
                        </p>
                        <p className="mx-auto max-w-2xl text-xl text-gray-500">
                            <span className="font-semibold">{formatNumber(totalUsd)} usd</span> spent
                        </p>
                    </div>
                    <PostCards posts={posts} />
                </div>
            </div>
        </>
    )
}

const formatter = new Intl.NumberFormat('en-GB', { style: "decimal" });
const formatNumber = (num) => formatter.format(num);

const posts: (PostCard & {cost?: number})[] = [
    {
        title: 'Defifa',
        href: 'https://discord.com/channels/775859454780244028/1022899568402251837/1022900657373581332',
        category: { name: 'Game', href: '#' },
        description:
            'The Defifa experimental project is built using the forthcoming NFTRewards infrastructure that’ll be deployed alongside the V3 protocol. It creates a team-based NFT tournament to accompany the 2022 World Cup, where each token’s redemption value is readjusted depending on the team’s performance.',
        date: 'Sep 9, 2022',
        datetime: '2022-09-09',
        imageUrl:
            'https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2370&q=80',
        author: {
            name: 'jango.eth',
            href: 'https://twitter.com/me_jango',
            imageUrl:
                'https://pbs.twimg.com/profile_images/1414958948189413395/l89bNR2m_400x400.jpg',
        },
        cost: 30_770
    },
    {
        title: 'DevCon Casa',
        href: 'https://discord.com/channels/775859454780244028/873248745771372584/1017806413105467523',
        category: { name: 'Event', href: '#' },
        description:
            'As JuiceboxDAO looks to encourage and support game-changing projects and capital formation schemas to form leveraging the Juicebox protocol, it should consider sponsoring accessible in-real-life gatherings hosted by contributors intimately familiar with the protocol and its potential applications to big-picture ideas, and attended by passionate builders, designers, and capital allocators.',
        date: 'Sep 8, 2022',
        datetime: '2022-09-08',
        imageUrl:
            'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3869&q=80',
        author: {
            name: 'jango.eth',
            href: 'https://twitter.com/me_jango',
            imageUrl:
                'https://pbs.twimg.com/profile_images/1414958948189413395/l89bNR2m_400x400.jpg',
        },
        cost: 35_000
    },
    {
        title: 'JokeDAO v2',
        href: 'https://www.jokedao.io/',
        category: { name: 'Governance', href: '#' },
        description:
            'jokedao is bottom-up, on-chain governance for communities to submit entries and vote on favorites. instead of central teams putting proposals to their community, communities vote on their own ideas. it\'s actual decentralized governance.',
        date: 'June 16, 2022',
        datetime: '2022-06-16',
        imageUrl:
            'https://www.jokedao.io/home@1440.jpg',
        author: {
            name: 'Sean McCaffery',
            href: 'https://twitter.com/seanmc_eth',
            imageUrl:
                'https://cdn.stamp.fyi/avatar/seanmc.eth?s=160',
        },
        cost: 40_000,
    },
    {
        title: 'Buidl Guidl x Juicebox Hackathon',
        href: 'https://www.jokedao.io/contest/polygon/0x3Aa9538c6aCD23526fF72f75A9b9160a275379C3',
        category: { name: 'Hackathon', href: '#' },
        description:
            'The goal of this proposal is to encourage members of this builder community to become familiar with Juicebox v2 through their favorite activities: building and experimentation on the blockchain!',
        date: 'June 3, 2022',
        datetime: '2022-06-03',
        imageUrl:
            'https://buidlguidl.com/assets/bg_castle.png',
        author: {
            name: 'Nicholas',
            href: 'https://twitter.com/nnnnicholas',
            imageUrl:
                'https://cdn.stamp.fyi/avatar/nnnnicholas.eth?s=160',
        },
        cost: 20_000,
    },
    {
        title: 'Code4rena Audit',
        href: 'https://code4rena.com/contests/2022-07-juicebox-v2-contest',
        category: { name: 'Security', href: 'https://info.juicebox.money/dev/resources/security' },
        description:
            'Code4rena is an audit marketplace. Many participants compete to win an audit bounty. It has a good reputation and is trusted by many top protocols for audit bounties (most recently OpenSea Seaport). ',
        date: 'June 2, 2022',
        datetime: '2022-06-02',
        imageUrl:
            'https://repository-images.githubusercontent.com/508805089/98eb6165-b77a-40e6-8796-a14bc11b23e7',
        author: {
            name: 'Nicholas',
            href: 'https://twitter.com/nnnnicholas',
            imageUrl:
                'https://cdn.stamp.fyi/avatar/nnnnicholas.eth?s=160',
        },
        cost: 110_000 + 22_500, // v2 + v3 review
    },
    {
        title: 'DAO NYC Sponsorship',
        href: 'https://www.dao-nyc.xyz/',
        category: { name: 'Event', href: '#' },
        description:
            'DAO NYC will be the flagship DAO Event in New York, a conference for DAO’s by DAO’s to talk and learn...about DAO’s. This proposal is to request that JuiceBox DAO to attend and sponsor the event.',
        date: 'May 24, 2022',
        datetime: '2022-05-24',
        imageUrl:
            'https://pbs.twimg.com/profile_banners/1519446727744446464/1657046240/1500x500',
        author: {
            name: 'Dennison Bertram',
            href: 'https://twitter.com/DennisonBertram',
            imageUrl:
                'https://pbs.twimg.com/profile_images/1524798074962464769/CHKnFgnm_400x400.png',
        },
        cost: 10_000,
    },
    {
        title: 'JB + Morgenstern',
        href: 'https://www.events.juicebox.money/',
        category: { name: 'Event', href: '#' },
        description:
            'Allot $30,000USD to partner with Morgenstern’s Finest Ice Cream (MNYC) during NFT NYC (June 20-22) to entice, invite, and introduce project builders and dream seekers to learn about JB Protocol and make dreams f-ing come true …and dish out free ice cream!',
        date: 'May 19, 2022',
        datetime: '2022-05-19',
        imageUrl:
            'https://pbs.twimg.com/media/FVn_15QWQAA6jnW?format=jpg&name=medium',
        author: {
            name: 'Zom BaΞ',
            href: 'https://twitter.com/Zom_Bae_',
            imageUrl:
                'https://pbs.twimg.com/profile_images/1459252874056249351/vx9dpRpp_400x400.jpg',
        },
        cost: 31_000,
    },
    {
        title: 'Thousand Ant to create explainer video to help onboarding',
        href: 'https://www.youtube.com/watch?v=hPPyuyii1Oo',
        category: { name: 'Tutorial', href: 'https://info.juicebox.money/user' },
        description:
            'Thousand Ant will create a "What does it mean to invest in a juicebox project?" animated technical explainer video to serve as a tool for all Juicebox projects to share with potential contributors. ',
        date: 'Dec 15, 2021',
        datetime: '2021-12-15',
        imageUrl:
            '/images/banny_tutorial.png',
        author: {
            name: 'Suspicious Seaweed',
            href: 'https://twitter.com/sus_seaweed',
            imageUrl:
                'https://pbs.twimg.com/profile_images/1517965533328683010/j_lpSlb0_400x400.jpg',
        },
        cost: 10_000,
    },
    {
        title: 'Juicebox v2 Audit',
        href: '/snapshot/jbdao.eth/proposal/0x87845e3801455e792b8b549e9d0fe6c2a81eb36bf70a9b06f6d293789f743534',
        category: { name: 'Security', href: 'https://info.juicebox.money/dev/resources/security' },
        description:
            'With the launch of V2.0 the JuiceboxDAO would like to conduct an end-to-end audit of the updated smart contracts. This audit will help minimize the risk of future smart contract exploits and increase the security and reliability of the system.',
        date: 'Dec 11, 2021',
        datetime: '2021-12-11',
        imageUrl:
            'https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2148&q=80',
        author: {
            name: 'Mr.Goldstein',
            href: 'https://twitter.com/Mr__Goldstein',
            imageUrl:
                'https://pbs.twimg.com/profile_images/1505328697489952772/M4t7lt2G_400x400.jpg',
        },
        cost: 120_000,
    },
    {
        title: 'Produce Juicebox Podcast',
        href: 'https://anchor.fm/thejuicecast',
        category: { name: 'Podcast', href: '#' },
        description:
            'This podcast and Twitter AMA would serve to bring the Juicebox protocol to a wider audience, both through distribution on social media and increased public understanding of the Juicebox protocol and DAO concepts.',
        date: 'Nov 27, 2021',
        datetime: '2021-11-27',
        imageUrl:
            'https://s3-us-west-2.amazonaws.com/anchor-generated-image-bank/production/podcast_uploaded_nologo400/20172808/20172808-1639932274124-70f0c914e9d5f.jpg',
        author: {
            name: 'filipv',
            href: 'https://twitter.com/filipv_',
            imageUrl:
                'https://cdn.stamp.fyi/avatar/filipv.eth?s=160',
        },
        cost: 1_500*6 + 2_000*4 + 3_000*6, // 6 fc for 0xSTVG and fillipv, 4 fc for matthew and brileigh (ongoing recurring payouts)
    },
    {
        title: 'Metaverse Curation',
        href: 'https://www.cryptovoxels.com/play?coords=NW@6643W,243N',
        category: { name: 'Metaverse', href: '#' },
        description:
            'The Juicebox Lounge has become an exciting and unique voxel experience that has been featured internationally linking Juicebox to the forefront of metaverse marketing & web3 grassroots community building campaigns.',
        // First proposal: https://www.notion.so/juicebox/Juicebox-CryptoVoxels-Proposal-3f1f1d4a6b934486867a05fbf534b3f9
        date: 'Oct 4, 2021',
        datetime: '2021-10-04',
        imageUrl:
            'https://pbs.twimg.com/media/FWeRnlaUcAA7AMV?format=jpg&name=medium',
        author: {
            name: 'Lexicon_devils',
            href: 'https://twitter.com/devils_lexicon',
            imageUrl:
                'https://pbs.twimg.com/profile_images/1512398138962763787/6M7lgMbx_400x400.jpg',
        },
        cost: 6_600 * (32-15), // Lexicon Devil
    },
]