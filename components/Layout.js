import Link from 'next/link'
import Head from 'next/head'
import Profile from '../components/Profile.js'

export default function Layout({ children, home, pageTitle, pageDescription }) {
  return (
    <div>
      <Head>
        <title>JuiceTool</title>
        <meta name="description" content="A bunch of homebrew tools" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="flex mt-5">
        {!home && (
          <div className="flex m-5 p-3 bg-amber-200 text-2xl rounded-xl border-3 border-solid border-slate-200 gap-4 items-center transition-colors hover:border-blue-400 hover:text-blue-400">
            <Link href="/">
              <a>← Back to home</a>
            </Link>
          </div>
        )}
        <div className="gap-6 flex-1"></div>
        <Profile />
      </header>
      <main>
        {!home && (
          <div className="bg-grey-lightest border-b">
            <div className="xs:py-8 xs:px-8 md:px-4 lg:px-0 sm:py-12 sm:pt-6 sm:max-w-3xl m-auto">
                <div className="text-4xl text-nouns pb-6 tracking-wide">
                    {pageTitle || "No title"}
                </div>
                <div className="sm:flex sm:items-center ">
                    <div className="sm:flex-auto mb-4">
                        <p className="text-md font-medium mt-4">
                          {pageDescription || "No description"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        )}
        {children}
      </main>
    </div>
  )
}
