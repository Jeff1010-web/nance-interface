import { Disclosure } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import Head from 'next/head'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface SiteNavProps {
  pageTitle: string,
  description?: string,
  image?: string
  withWallet?: boolean;
  space?: string;
}

export default function SiteNav({ pageTitle, description, image, withWallet, space }: SiteNavProps) {
  const router = useRouter();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Treasury', href: '/treasury' },
    { name: 'Reconfiguration', href: '/juicebox' },
    { name: 'Analytics', href: 'https://app.flipsidecrypto.com/dashboard/snapshot-plus-data-ueqrnb' },
    { name: 'Support us', href: 'https://juicebox.money/v2/p/477' },
    { name: 'Other spaces', href: '/s' }
  ]

  const meta = {
    title: `${pageTitle} | Nance`,
    description: description || "Nance platform for automatic governance.",
    url: `https://jbdao.org${router.asPath}`,
    image: image || "/images/unsplash_application.jpeg",
  }

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="viewport" content="width=device-width" />
        <link rel="icon" href="/favicon.svg" />
        {/* OpenGraph Meta Tags */}
        <meta property="og:url" content={meta.url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content={meta.image} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="jbdao.org" />
        <meta property="twitter:url" content={meta.url} />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
      </Head>
      <header className="min-h-full w-full">
        <Disclosure as="nav" className="bg-white border-b border-gray-200">
          {({ open }) => (
            <>
              <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <Link href="/" legacyBehavior>
                        <a>
                          <img
                            className="block h-8 w-auto"
                            src="/favicon.svg"
                            alt="JBDAO logo"
                          />
                        </a>
                      </Link>
                    </div>
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className='border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-6">
                    <button
                      type="button"
                      className="w-fit inline-flex items-center justify-center rounded-xl border border-transparent bg-[#0E76FD] px-3 py-2 text-md font-bold disabled:text-black text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                      onClick={() => router.push(space ? `/s/${space}/edit` : "/edit")}>
                      New Proposal
                    </button>

                    { withWallet && <ConnectButton /> }
                  </div>

                  <div className="-mr-2 flex items-center sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="py-2 space-y-1">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className='border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>

                <div className="py-2 mx-2 border-t border-gray-200 space-y-3">
                  <button
                    type="button"
                    className="w-fit inline-flex items-center justify-center rounded-xl border border-transparent bg-[#0E76FD] px-3 py-2 text-md font-bold disabled:text-black text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                    onClick={() => router.push(space ? `/s/${space}/edit` : "/edit")}>
                    New Proposal
                    </button>
                  { withWallet && <ConnectButton /> }
                </div>

              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </header>
    </>
  )
}
