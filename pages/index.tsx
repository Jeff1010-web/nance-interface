import PostCards, { PostCard } from "../components/PostCards"
import SiteNav from "../components/SiteNav"

const posts: PostCard[] = [
    {
        title: 'Snapshot voting with search, filter and more stats',
        href: '/snapshot/jbdao.eth',
        category: { name: 'Governance', href: '#' },
        description:
            'Have you ever wanted to search for proposals? Or filter by status? Or see more stats? Now you can use Snapshot Plus.',
        date: 'Sep 15, 2022',
        datetime: '2022-09-15',
        imageUrl:
            '/images/unsplash_voting.jpeg',
        author: {
            name: 'twodam.eth',
            href: 'https://twitter.com/twodam_eth/status/1570426249750925314?s=20&t=EnBSIboDxBraHRRrQth50w',
            imageUrl:
                'https://cdn.stamp.fyi/avatar/twodam.eth?s=160',
        },
    },
    {
        title: 'Automate your governance system',
        href: '/nance/juicebox',
        category: { name: 'Governance', href: '#' },
        description:
            'Nance is a tool for automating your governance system. It can integrate with Notion, Discord, Snapshot and Juicebox to create a seamless experience for your community. Check repo on https://github.com/jigglyjams/nance-ts.',
        date: 'May 5, 2022',
        datetime: '2022-05-05',
        imageUrl:
            'https://images.unsplash.com/photo-1586374579358-9d19d632b6df?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80',
        author: {
            name: 'jigglyjams.eth',
            href: 'https://twitter.com/jjjjigglyjams',
            imageUrl:
                'https://cdn.stamp.fyi/avatar/jigglyjams.eth?s=160',
        },
    },
    {
        title: 'Visualize the diff of two transactions',
        href: '/diff',
        category: { name: 'Project', href: '#' },
        description:
            'Ever wanted to see the diff of two transactions? Now you can with the Transaction Diff tool. Just enter the transaction hashes and see the diff. In a strucutal&typed way.',
        date: 'Oct 4, 2022',
        datetime: '2022-10-04',
        imageUrl:
            'https://images.unsplash.com/photo-1591691203197-c00ee071407a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2381&q=80',
        author: {
            name: 'twodam.eth',
            href: 'https://twitter.com/twodam_eth/status/1581844871597654019?s=20&t=kIKp2lWVlMrvV5fNdwquVw',
            imageUrl:
                'https://cdn.stamp.fyi/avatar/twodam.eth?s=160',
        },
    },
]

export default function Home() {
    return (
        <>
            <SiteNav pageTitle="Home" description="Homebrew docs and tools for Juicebox ecosystems" />
            <div className="relative bg-gray-50 px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
                <div className="absolute inset-0">
                    <div className="h-1/3 bg-white sm:h-2/3" />
                </div>
                <div className="relative mx-auto max-w-7xl">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">JuiceTool</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
                            Homebrew docs and tools for Juicebox ecosystems.
                        </p>
                    </div>
                    <PostCards posts={posts} />
                </div>
            </div>
            <footer className="bg-gray-50">
                <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
                <div className="flex justify-center space-x-6 md:order-2">
                    {navigation.map((item) => (
                    <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">{item.name}</span>
                        <item.icon className="h-6 w-6" aria-hidden="true" />
                    </a>
                    ))}
                </div>
                <div className="mt-8 md:order-1 md:mt-0">
                    <p className="text-center text-base text-gray-400">&copy; 2022</p>
                </div>
                </div>
            </footer>
        </>
    )
}

/* This example requires Tailwind CSS v2.0+ */
const navigation = [
    {
      name: 'Twitter',
      href: 'https://twitter.com/twodam_eth',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: 'https://github.com/jbx-protocol/juicetool',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Juicebox',
      href: 'https://www.juicebox.money/@twodam',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ]
  