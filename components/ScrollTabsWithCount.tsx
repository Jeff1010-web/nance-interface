export interface ScrollTabOption {
    id: string;
    name: string;
    count: number;
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function ScrollTabsWithCount({ tabs, activeTab }: { tabs: ScrollTabOption[], activeTab: string }) {

    return (
        
          <nav className="-mb-px flex space-x-8 overflow-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={`/snapshot/${tab.id}`}
                className={classNames(
                  tab.id == activeTab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200',
                  'whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm'
                )}
                aria-current={tab.id == activeTab ? 'page' : undefined}
              >
                {tab.name}
                {(tab.count > 0) ? (
                  <span
                    className={classNames(
                      tab.id == activeTab ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900',
                      'hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </a>
            ))}
          </nav>
        
    )
}