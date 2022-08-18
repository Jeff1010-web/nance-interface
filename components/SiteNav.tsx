/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import Head from 'next/head'
import { ConnectButton } from '@rainbow-me/rainbowkit';

const user = {
    name: 'Tom Cook',
    email: 'tom@example.com',
    imageUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [
    { name: 'Home', href: '/', current: false },
    { name: 'Progress', href: '/progress', current: false },
    { name: 'Metric', href: '/metric', current: false },
    { name: 'Funding', href: '/funding', current: false },
    { name: 'Timeline', href: '/history', current: false },
    { name: 'Snapshot', href: '/snapshot/jbdao.eth', current: false },
    { name: 'Juicebox', href: '/juicebox', current: false },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function SiteNav({ pageTitle, currentIndex }) {
    const currentNavigation = navigation;
    navigation[currentIndex].current = true;

    return (
        <>
            <Head>
                <title>{`${pageTitle} | JuiceTool`}</title>
                <meta name="viewport" content="width=device-width" />
                <meta name="description" content="A bunch of homebrew tools" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header className="min-h-full w-full">
                <Disclosure as="nav" className="bg-white border-b border-gray-200">
                    {({ open }) => (
                        <>
                            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex justify-between h-16">
                                    <div className="flex">
                                        <div className="flex-shrink-0 flex items-center">
                                            <img
                                                className="block lg:hidden h-8 w-auto"
                                                src="https://tailwindui.com/img/logos/workflow-mark.svg?color=indigo&shade=600"
                                                alt="Workflow"
                                            />
                                            <img
                                                className="hidden lg:block h-8 w-auto"
                                                src="https://tailwindui.com/img/logos/workflow-mark.svg?color=indigo&shade=600"
                                                alt="Workflow"
                                            />
                                        </div>
                                        <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                                            {navigation.map((item) => (
                                                <a
                                                    key={item.name}
                                                    href={item.href}
                                                    className={classNames(
                                                        item.current
                                                            ? 'border-indigo-500 text-gray-900'
                                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                                                    )}
                                                    aria-current={item.current ? 'page' : undefined}
                                                >
                                                    {item.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                        <ConnectButton />
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
                                <div className="pt-2 pb-3 space-y-1">
                                    {navigation.map((item) => (
                                        <Disclosure.Button
                                            key={item.name}
                                            as="a"
                                            href={item.href}
                                            className={classNames(
                                                item.current
                                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                                                'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                                            )}
                                            aria-current={item.current ? 'page' : undefined}
                                        >
                                            {item.name}
                                        </Disclosure.Button>
                                    ))}
                                </div>
                                <div className="pt-4 pb-3 border-t border-gray-200">
                                    <ConnectButton />
                                </div>
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>
            </header>
        </>
    )
}
