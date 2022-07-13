import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import ConversionFunnelChart from '../components/ConversionFunnelChart.js'
import ApprovalChart from '../components/ApprovalRateChart.js'

export default function Home() {
  return (
    <div className="px-8">
      <Head>
        <title>JuiceTools</title>
        <meta name="description" content="A bunch of homebrew tools" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen py-16 flex-1 flex flex-col justify-center items-center">
        <h1 className="text-7xl font-medium">
          DAO Analytics
        </h1>
        <Link href="https://mirror.xyz/itamarg.eth/Cxs_pTvMQ3-Udj1MYDZW46OZxGnHET1cHQX_tTozckw">
          <a className="text-3xl hover:underline">Methodology: DAO health</a>
        </Link>
        <br/>

        <div className="flex items-center justify-center flex-wrap max-w-7xl text-inherit">
          <div className="m-4 p-6 text-left no-underline rounded-xl border-solid border-slate-100 border-2 max-w-5xl transition-colors hover:border-blue-400 hover:text-blue-400">
            <h2 className="text-2xl mb-4">Member Conversion Funnel &rarr;</h2>
            <ConversionFunnelChart />
          </div>

          <div className="m-4 p-6 text-left no-underline rounded-xl border-solid border-slate-100 border-2 max-w-5xl transition-colors hover:border-blue-400 hover:text-blue-400">
            <h2 className="text-2xl mb-4">Proposal Approval Rate &rarr;</h2>
            <ApprovalChart />
          </div>
        </div>
      </main>

      <footer className="flex flex-1 py-16 rounded-t-sm border-solid border-black justify-center items-center">
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center grow"
        >
          Powered by{' '}
          <span className="ml-2 h-4">
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
