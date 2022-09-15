import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'

function range(start, end) {
  return Array(end - start + 1).fill(1).map((_, idx) => start + idx)
}

export default function Pagination({ page, setPage, total }) {
    const limit = 10;
    const itemStart = (page - 1) * limit + 1;
    const itemEnd = Math.min(page * limit, total);
    const pages = Math.ceil(total / limit);

    const firstPages = Math.max(1, page - 3);
    const lastPages = Math.min(page + 3, pages);

    const renderedPages = range(firstPages, lastPages).map((p) => {
      if(p === page) {
        return (
          <input key={p} type="number" aria-current="page" max={pages} min={1} step={1} value={page} onChange={e => setPage(e.target.value)} name="page-input" id="page-input" className="relative z-10 inline-flex items-center border border-indigo-500 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 focus:z-20" />
        )
      } else {
        return (
          <button
            key={p}
            onClick={() => setPage(p)}
            className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
          >
            {p}
          </button>
        )
      } 
    })

  return (
    <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{itemStart}</span> to <span className="font-medium">{itemEnd}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            {/* Current: "z-10 bg-indigo-50 border-indigo-500 text-indigo-600", Default: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50" */}
            {renderedPages}
            <button
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
              className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}