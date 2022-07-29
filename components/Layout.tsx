import Link from 'next/link'
import Head from 'next/head'
import Profile from '../components/Profile'
import { PropsWithChildren } from 'react'

export interface Props {
  home?: boolean,
  pageTitle: string,
  pageDescription?: string
}

export default function Layout({ children, home = false, pageTitle, pageDescription = "" }: PropsWithChildren<Props>) {
  return (
    <div>
      <Head>
        <title>{`${pageTitle} | JuiceTool`}</title>
        <meta name="description" content="A bunch of homebrew tools" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="flex mt-5">
        {!home && (
          <div className="flex m-5 p-3 bg-amber-200 text-2xl rounded-xl border-3 border-solid border-slate-200 gap-4 items-center transition-colors hover:bg-amber-300">
            <Link href="/">
              <a>Homepage</a>
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
                <div className="text-4xl pb-6 tracking-wide">
                    {pageTitle}
                </div>
                <div className="sm:flex sm:items-center ">
                    <div className="sm:flex-auto mb-4">
                        <p className="text-md font-medium mt-4">
                          {pageDescription}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        )}
        {children}
        
        <div className="relative mt-3 xs:px-6 sm:px-0 text-black font-medium gap-2 items-center w-full flex flex-col text-center border-t pt-4">
          <p>JuiceTool curates docs and tools around Juicebox ecosystem.</p>
          <a target="_blank" rel="noopener noreferrer" href="https://www.juicebox.money/@twodam" className="p-2 text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm">Sponsor on Juicebox</a>
          <div className="flex gap-8 items-center">
            <a href="https://twitter.com/juiceboxETH" target="_blank" rel="noreferrer">
              <svg className="w-6 h-8 fill-black hover:fill-gray-400 transition cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
              </svg>
            </a>
            <a href="https://discord.gg/juicebox" target="_blank" rel="noreferrer">
              <svg className="h-8 w-7 fill-black hover:fill-gray-400 transition cursor-pointer" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <style type="text/css"></style>
                <g id="Layer_1"></g>
                <g id="Layer_2"><g><g><path className="st89" d="M85.22,24.958c-11.459-8.575-22.438-8.334-22.438-8.334l-1.122,1.282 c13.623,4.087,19.954,10.097,19.954,10.097c-19.491-10.731-44.317-10.654-64.59,0c0,0,6.571-6.331,20.996-10.418l-0.801-0.962 c0,0-10.899-0.24-22.438,8.334c0,0-11.54,20.755-11.54,46.319c0,0,6.732,11.54,24.442,12.101c0,0,2.965-3.526,5.369-6.571 c-10.177-3.045-14.024-9.376-14.024-9.376c6.394,4.001,12.859,6.505,20.916,8.094c13.108,2.698,29.413-0.076,41.591-8.094 c0,0-4.007,6.491-14.505,9.456c2.404,2.965,5.289,6.411,5.289,6.411c17.71-0.561,24.441-12.101,24.441-12.02 C96.759,45.713,85.22,24.958,85.22,24.958z M35.055,63.824c-4.488,0-8.174-3.927-8.174-8.815 c0.328-11.707,16.102-11.671,16.348,0C43.229,59.897,39.622,63.824,35.055,63.824z M64.304,63.824 c-4.488,0-8.174-3.927-8.174-8.815c0.36-11.684,15.937-11.689,16.348,0C72.478,59.897,68.872,63.824,64.304,63.824z"></path></g></g></g>
              </svg>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
