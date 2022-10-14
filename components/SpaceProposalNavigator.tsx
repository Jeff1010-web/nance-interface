import { Dispatch, Fragment, SetStateAction, useContext, useState } from 'react'
import { Dialog, Disclosure, Menu, Popover, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import { ChevronDownIcon, DocumentSearchIcon } from '@heroicons/react/solid'
import { SpaceInfo } from '../hooks/snapshot/SpaceInfo'
import useFollowedSpaces from '../hooks/snapshot/FollowedSpaces'
import { SpaceContext } from '../pages/snapshot/[space]'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

interface FilterOption {
    id: string,
    name: string,
    value: boolean,
    setter: Dispatch<SetStateAction<boolean>>
}

export default function SpaceProposalNavigator({spaceInfo, options, keyword, setKeyword, limit, setLimit}: {spaceInfo: SpaceInfo, options: FilterOption[], keyword: string, setKeyword: Dispatch<SetStateAction<string>>, limit: number, setLimit: Dispatch<SetStateAction<number>>}) {
  const [open, setOpen] = useState(false);
  const context = useContext(SpaceContext);

  const { data: followedSpaces } = useFollowedSpaces(context.address);
  const tabs = context.address ? followedSpaces : [];
  const activeFilters = options.filter(option => option.value);

  const filters = [
    {
      id: 'status',
      name: 'Status',
      options,
    }
  ]

  return (
    <div className="bg-white">
      {/* Mobile filter dialog */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 sm:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="ml-auto relative max-w-xs w-full h-full bg-white shadow-xl py-4 pb-12 flex flex-col overflow-y-auto">
                <div className="px-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 w-10 h-10 bg-white p-2 rounded-md flex items-center justify-center text-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4">
                  {filters.map((section) => (
                    <Disclosure as="div" key={section.name} className="border-t border-gray-200 px-4 py-6">
                      {({ open }) => (
                        <>
                          <h3 className="-mx-2 -my-3 flow-root">
                            <Disclosure.Button className="px-2 py-3 bg-white w-full flex items-center justify-between text-sm text-gray-400">
                              <span className="font-medium text-gray-900">{section.name}</span>
                              <span className="ml-6 flex items-center">
                                <ChevronDownIcon
                                  className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                                  aria-hidden="true"
                                />
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel className="pt-6">
                            <div className="space-y-6">
                              {section.options.map((option, optionIdx) => (
                                <div key={option.id} className="flex items-center">
                                  <input
                                    id={`filter-mobile-${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    defaultValue={option.id}
                                    type="checkbox"
                                    className="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                                    checked={option.value}
                                    onChange={(e) => option.setter(e.target.checked)}
                                  />
                                  <label
                                    htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                    className="ml-3 text-sm text-gray-500"
                                  >
                                    {option.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="max-w-7xl mx-auto py-6 lg:py-16 px-4 sm:px-6 lg:px-8">
        {/* Followed Space Tabs */}
        <div>
          <div>
            <nav className="-mb-px flex space-x-8 overflow-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <a
                  key={tab.name}
                  href={`/snapshot/${tab.id}`}
                  className={classNames(
                    tab.id == context.space
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200',
                    'whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm'
                  )}
                  aria-current={tab.id == context.space ? 'page' : undefined}
                >
                  {tab.name}
                  {tab.activeProposals ? (
                    <span
                      className={classNames(
                        tab.id == context.space ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900',
                        'hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'
                      )}
                    >
                      {tab.activeProposals}
                    </span>
                  ) : null}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Space Info */}
        <img
          className="mt-6 inline-block h-14 w-14 rounded-full"
          src={`https://cdn.stamp.fyi/space/${context.space}?s=160`}
          alt=""
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{spaceInfo?.name || context.space}</h1>
        <p className="mt-4 max-w-xl text-sm text-gray-700">
          {spaceInfo?.about || ''}
        </p>

        {/* Space Stats */}
        <div>
          <dl className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3">
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Follwers</dt>
              <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{spaceInfo?.followersCount}</dd>
            </div>
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Proposals</dt>
              <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{spaceInfo?.proposalsCount}</dd>
            </div>
          </dl>
        </div>

        {/* Search bar and limit */}
        <div>
          <label htmlFor="email" className="mt-5 block text-sm font-medium text-gray-700">
            Search proposals
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <div className="relative flex flex-grow items-stretch focus-within:z-10">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DocumentSearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="proposal-title"
                id="proposal-title"
                className="block w-full rounded-none rounded-l-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="grant, swap and payout etc."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="limit" className="sr-only">
                Limit
              </label>
              <select
                id="limit"
                name="limit"
                className="relative w-full rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-700 hover:bg-gray-100 bg-gray-50"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={150}>150</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section aria-labelledby="filter-heading">
        <h2 id="filter-heading" className="sr-only">
          Filters
        </h2>

        <div className="relative z-10 bg-white border-b border-gray-200 pb-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-end sm:px-6 lg:px-8">
            {/* <Menu as="div" className="relative inline-block text-left sm:hidden">
              <div>
                <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                  Jump to space
                  <ChevronDownIcon
                    className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-left absolute left-0 mt-2 w-40 rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-auto">
                  <div className="py-1">
                    {tabs.map((tab) => (
                      <Menu.Item key={tab.id}>
                        {({ active }) => (
                            <div className={classNames(
                                active ? 'bg-gray-100' : '',
                                'flex items-center pl-3'
                            )}>
                                <span
                                    className={classNames(
                                    tab.activeProposals>0 ? 'bg-green-400' : 'bg-gray-200',
                                    'flex-shrink-0 inline-block h-2 w-2 rounded-full'
                                    )}
                                    aria-hidden="true"
                                />
                                <a
                                    href={`/snapshot/${tab.id}`}
                                    className={classNames(
                                      tab.activeProposals>0 ? 'font-medium text-gray-900' : 'text-gray-500',
                                        'block px-4 py-2 text-sm'
                                    )}
                                >
                                    {tab.name}
                                </a>
                            </div>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu> */}

            <button
              type="button"
              className="inline-block text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden"
              onClick={() => setOpen(true)}
            >
              Select Filters
            </button>

            <div className="hidden sm:block">
              <div className="flow-root">
                <Popover.Group className="-mx-4 flex items-center divide-x divide-gray-200">
                  {filters.map((section, sectionIdx) => (
                    <Popover key={section.name} className="px-4 relative inline-block text-left">
                      <Popover.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                        <span>{section.name}</span>
                        {sectionIdx === 0 ? (
                          <span className="ml-1.5 rounded py-0.5 px-1.5 bg-gray-200 text-xs font-semibold text-gray-700 tabular-nums">
                            {activeFilters.length}
                          </span>
                        ) : null}
                        <ChevronDownIcon
                          className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                      </Popover.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Popover.Panel className="origin-top-right absolute right-0 mt-2 bg-white rounded-md shadow-2xl p-4 ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <form className="space-y-4">
                            {section.options.map((option, optionIdx) => (
                              <div key={option.id} className="flex items-center">
                                <input
                                  id={`filter-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  defaultValue={option.id}
                                  type="checkbox"
                                  className="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                                  checked={option.value}
                                  onChange={(e) => option.setter(e.target.checked)}
                                />
                                <label
                                  htmlFor={`filter-${section.id}-${optionIdx}`}
                                  className="ml-3 pr-6 text-sm font-medium text-gray-900 whitespace-nowrap"
                                >
                                  {option.name}
                                </label>
                              </div>
                            ))}
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  ))}
                </Popover.Group>
              </div>
            </div>
          </div>
        </div>

        {/* Active filters */}
        <div className="bg-gray-100">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:flex sm:items-center sm:px-6 lg:px-8">
            <h3 className="text-sm font-medium text-gray-500">
              Enabled Filters
              <span className="sr-only">, active</span>
            </h3>

            <div aria-hidden="true" className="hidden w-px h-5 bg-gray-300 sm:block sm:ml-4" />

            <div className="mt-2 sm:mt-0 sm:ml-4">
              <div className="-m-1 flex flex-wrap items-center">
                {activeFilters.map((activeFilter) => (
                  <span
                    key={activeFilter.id}
                    className="m-1 inline-flex rounded-full border border-gray-200 items-center py-1.5 pl-3 pr-2 text-sm font-medium bg-white text-gray-900"
                  >
                    <span>{activeFilter.name}</span>
                    <button
                      type="button"
                      className="flex-shrink-0 ml-1 h-4 w-4 p-1 rounded-full inline-flex text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                      onClick={() => activeFilter.setter(false)}
                    >
                      <span className="sr-only">Remove filter for {activeFilter.name}</span>
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
