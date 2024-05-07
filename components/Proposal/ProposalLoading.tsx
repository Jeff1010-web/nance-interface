
export default function ProposalLoading() {
  return (
    <div className="animate-pulse">
      <div className="px-4 py-5 sm:px-6 flex flex-col">
        <h1 id="applicant-information-title" className="text-3xl font-medium bg-gray-300 rounded w-3/4 mb-4"></h1>

        <p className="text-sm text-gray-500 text-right bg-gray-200 rounded w-1/4 mb-2"></p>

        <div className="text-sm text-gray-500 text-right bg-gray-200 rounded w-1/3 mb-2"></div>

        <div className="text-sm text-gray-500 text-right bg-gray-200 rounded w-1/2 mb-2"></div>

        <ProposalMetadataSkeleton />
        <div className="bg-gray-200 rounded w-1/2 mb-2"></div>
      </div>

      <div className="px-4 sm:px-6">
        {/* Replace MarkdownWithTOC with a loading skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
      </div>

      <div className="px-4 py-5 sm:px-6 mt-4">
        {/* ProposalNavigator - Replace with your specific loader */}
        <div className="bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
        <ProposalSidebarSkeleton />
      </div>
    </div>
  );
}

export const ProposalMetadataSkeleton = () => {
  return (
    <div className="my-4 border bg-gray-100 rounded-md px-4 py-5 sm:px-6">
      <div className="animate-pulse">
        <h2 className="text-gray-500 mb-3">
          Metadata
          <div className="h-4 w-4 bg-gray-300 rounded-md inline-block ml-2"></div>
        </h2>
        <div className="gaps-4">
          <div className="col-span-2">
            <div className="font-medium col-span-2">
              <div className="h-4 w-3/4 bg-gray-300 rounded-md"></div>
            </div>
            <div className="col-span-2 flex flex-col mt-2 w-full space-y-2">
              <div className="h-4 w-full bg-gray-300 rounded-md"></div>
              <div className="h-4 w-full bg-gray-300 rounded-md"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 mt-2">
            <div className="col-span-2">
              <span className="font-medium">Cycle</span>
              <div className="h-4 w-full bg-gray-300 rounded-md"></div>
            </div>
            <div className="col-span-2">
              <span className="font-medium">Snapshot</span>
              <div className="h-4 w-full bg-gray-300 rounded-md"></div>
            </div>
            <div className="col-span-2">
              <span className="font-medium">Discussion:</span>
              <div className="h-4 w-full bg-gray-300 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProposalSidebarSkeleton = () => {
  return (
    <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
      <div className="overflow-y-scroll pt-5">
        <div className="">
          <div className="animate-pulse space-y-4">
            {/* Skeleton for proposal statistics */}
            <div className="flex justify-between">
            </div>
            <div className="p-3 text-sm text-gray-500" />
            <div className="flex justify-between">
              <p className="text-sm" />
              <p className="text-sm" />
            </div>
          </div>

          {/* Skeleton for votes list */}
          <ul role="list" className="space-y-2 pt-2">
            {[1, 2, 3, 4, 5].map((index) => (
              <li key={index}>
                <div>
                  <div>
                    <div className="text-sm flex justify-between">
                      <div>
                        <div className="inline" />
                      </div>
                      <div />
                    </div>
                    <div className="text-sm flex flex-col">
                      <div>
                        <div className="inline" />
                      </div>
                      <div className="text-xs" />
                      <div className="text-sm text-gray-600 py-2">
                        <p />
                        <p />
                        <p />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
