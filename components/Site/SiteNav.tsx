import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

interface SiteNavProps {
  pageTitle: string;
  description?: string;
  image?: string;
  withWallet?: boolean;
  space?: string;
  proposalId?: string;
  withProposalButton?: boolean;
  withSiteSuffixInTitle?: boolean;
  mobileHeaderCenter?: JSX.Element;
}

export default function SiteNav({
  pageTitle,
  description,
  image,
  withWallet,
  space,
  proposalId,
  withProposalButton = true,
  withSiteSuffixInTitle = true,
  mobileHeaderCenter = <></>,
}: SiteNavProps) {
  const router = useRouter();

  const homePath = space ? `/s/${space}` : "/";
  const navigation = [
    { name: "Home", href: homePath },
    { name: "Spaces", href: "/s" },
    { name: "Docs", href: "https://docs.nance.app" },
  ];

  const meta = {
    title: withSiteSuffixInTitle ? `${pageTitle} | Nance` : pageTitle,
    description: description || "Nance platform for automatic governance.",
    url: `https://nance.app${router.asPath}`,
    image: image || "/images/opengraph/OG_splash.png",
  };

  const canForkProposal = !!proposalId;
  let editProposalUrl = space ? `/s/${space}/edit` : "/edit";
  if (canForkProposal) {
    editProposalUrl = editProposalUrl + `?&proposalId=${proposalId}&fork=true`;
  }

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="viewport" content="width=device-width" />
        <link rel="icon" href="/favicon.ico" />
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
        <Disclosure as="nav" className="border-b border-gray-200 bg-white">
          {({ open }) => (
            <>
              <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                  <div className="flex">
                    <div className="flex flex-shrink-0 items-center">
                      <Link href="/">
                        <Image
                          className="block h-8 w-auto"
                          src="/images/logo-min.svg"
                          alt="nance logo"
                          width={32}
                          height={32}
                        />
                      </Link>
                    </div>
                    <div className="hidden xl:-my-px xl:ml-6 xl:flex xl:space-x-8">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center md:hidden">
                    {mobileHeaderCenter}
                  </div>

                  <div className="hidden xl:ml-6 xl:flex xl:items-center xl:space-x-6">
                    {withProposalButton && (
                      <button
                        type="button"
                        className="text-md inline-flex w-fit items-center justify-center rounded-xl border border-transparent bg-[#0E76FD] px-3 py-2 font-bold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black disabled:opacity-50"
                        onClick={() => router.push(editProposalUrl)}
                      >
                        {canForkProposal ? "Fork Proposal" : "New Proposal"}
                      </button>
                    )}

                    {withWallet && <ConnectButton />}
                  </div>

                  <div className="-mr-2 flex items-center xl:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="xl:hidden">
                <div className="space-y-1 py-2">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>

                <div className="mx-2 space-y-3 border-t border-gray-200 py-2">
                  {withProposalButton && (
                    <button
                      type="button"
                      className="text-md inline-flex w-fit items-center justify-center rounded-xl border border-transparent bg-[#0E76FD] px-3 py-2 font-bold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black disabled:opacity-50"
                      onClick={() => router.push(editProposalUrl)}
                    >
                      {canForkProposal ? "Fork Proposal" : "New Proposal"}
                    </button>
                  )}

                  {withWallet && <ConnectButton />}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </header>
    </>
  );
}
