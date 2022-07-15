import Layout from '../components/Layout.js'
import Link from 'next/link'

export default function Home() {
  return (
    <Layout home>
      <div className="px-8">
        <main className="min-h-screen py-16 flex-1 flex flex-col items-center">
          <h1 className="text-7xl font-medium">
            Juicebox Center
          </h1>
          <br/>

          <div className="flex items-center flex-wrap max-w-fit text-inherit">
            <HomeCard link="/metric" linkText="DAO Health Metrics" />
            <HomeCard link="/funding" linkText="Funded Projects" />
            <HomeCard link="/history" linkText="Timeline" />
          </div>
        </main>
      </div>
    </Layout>
  )
}

function HomeCard({ link, linkText }) {
  return (
      <div className="m-4 p-6 text-left no-underline rounded-xl border-solid border-slate-300 border-2 max-w-xl transition-colors hover:border-blue-400 hover:text-blue-400">
          <Link href={link}>
          <h2 className="text-2xl">{linkText} &rarr;</h2>
          </Link>
      </div>
  )
}