import Link from 'next/link'
import Head from 'next/head'
import Profile from '../components/Profile.js'

export default function TopNav({ children, home }) {
  return (
    <div>
      <Head>
        <title>JuiceTool</title>
        <meta name="description" content="A bunch of homebrew tools" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="flex mt-5">
        {!home && (
          <div className="flex p-3 bg-amber-200 text-2xl rounded-xl border-3 border-solid border-slate-200 gap-4 items-center transition-colors hover:border-blue-400 hover:text-blue-400">
            <Link href="/">
              <a>← Back to home</a>
            </Link>
          </div>
        )}
        <div className="gap-6 flex-1"></div>
        <Profile />
      </header>
    </div>
  )
}
