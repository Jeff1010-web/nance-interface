import PostCards, { PostCard } from "../components/PostCards"
import SiteNav from "../components/SiteNav"

const posts: PostCard[] = [
    {
        title: 'Sponsor Development of jokedao v2',
        href: 'https://www.jokedao.io/',
        category: { name: 'Governance', href: '#' },
        description:
            'DAO governance *can* be fun, and jokedao has created the platform to enable that.',
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
    },
    {
        title: 'Buidl Guidl x Juicebox Hackathon',
        href: 'https://www.jokedao.io/contest/polygon/0x3Aa9538c6aCD23526fF72f75A9b9160a275379C3',
        category: { name: 'Hackathon', href: '#' },
        description:
            'The goal of this proposal is to encourage members of this builder community to become familiar with Juicebox v2 through their favorite activities: building and experimentation on the blockchain!',
        date: 'June 3, 2022',
        datetime: '2022-06-3',
        imageUrl:
            'https://buidlguidl.com/assets/bg_castle.png',
        author: {
            name: 'Nicholas',
            href: 'https://twitter.com/nnnnicholas',
            imageUrl:
                'https://cdn.stamp.fyi/avatar/nnnnicholas.eth?s=160',
        },
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
    },
    {
        title: 'On Going Metaverse Curation',
        href: 'https://www.cryptovoxels.com/play?coords=NW@6643W,243N',
        category: { name: 'Metaverse', href: '#' },
        description:
            'The Juicebox Lounge has become an exciting and unique voxel experience that has been featured internationally linking Juicebox to the forefront of metaverse marketing & web3 grassroots community building campaigns.',
        date: 'Apr 21, 2022',
        datetime: '2022-04-21',
        imageUrl:
            'https://pbs.twimg.com/media/FWeRnlaUcAA7AMV?format=jpg&name=medium',
        author: {
            name: 'Lexicon_devils',
            href: 'https://twitter.com/devils_lexicon',
            imageUrl:
                'https://pbs.twimg.com/profile_images/1512398138962763787/6M7lgMbx_400x400.jpg',
        },
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
    },
]

export default function Funding() {
    return (
        <>
            <SiteNav pageTitle="Funded Projects" />
            <div className="relative bg-gray-50 px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
                <div className="absolute inset-0">
                    <div className="h-1/3 bg-white sm:h-2/3" />
                </div>
                <div className="relative mx-auto max-w-7xl">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Funded Projects</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
                            Projects funded by JuiceboxDAO.
                        </p>
                    </div>
                    <PostCards posts={posts} />
                </div>
            </div>
        </>
    )
}