function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Tabs({ tabs, currentTab, setCurrentTab }: { tabs: string[], currentTab: string, setCurrentTab: (tab: string) => void }) {
    return (
        <div className="m-6">
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                    Select a tab
                </label>
                {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                <select
                    id="tabs"
                    name="tabs"
                    className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={currentTab}
                    onChange={(e) => setCurrentTab(e.target.value)}
                >
                    {tabs.map((tab) => (
                        <option key={tab}>{tab}</option>
                    ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <nav className="isolate flex divide-x divide-gray-200 rounded-lg shadow" aria-label="Tabs">
                    {tabs.map((tab, tabIdx) => (
                        <button
                            key={tab}
                            onClick={() => setCurrentTab(tab)}
                            className={classNames(
                                (tab === currentTab) ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
                                tabIdx === 0 ? 'rounded-l-lg' : '',
                                tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                                'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10'
                            )}
                            aria-current={(tab === currentTab) ? 'page' : undefined}
                        >
                            <span>{tab}</span>
                            <span
                                aria-hidden="true"
                                className={classNames(
                                    (tab === currentTab) ? 'bg-indigo-500' : 'bg-transparent',
                                    'absolute inset-x-0 bottom-0 h-0.5'
                                )}
                            />
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    )
}