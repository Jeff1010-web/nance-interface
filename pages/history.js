import Image from 'next/image'
import Link from 'next/link'
import TopNav from '../components/TopNav.js'

export default function History() {
  return (
    <div className="px-8">
      <TopNav/>

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
