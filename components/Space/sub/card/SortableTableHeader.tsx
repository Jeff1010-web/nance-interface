import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { BooleanParam, StringParam, useQueryParams, withDefault } from 'next-query-params';

type SortOptions = "" | "status" | "title" | "approval" | "participants" | "voted" | "date";

export default function SortableTableHeader({ val, label }: { val: SortOptions, label: string }) {
  const [query, setQuery] = useQueryParams({
    sortBy: withDefault(StringParam, ''),
    sortDesc: withDefault(BooleanParam, true)
  });

  const sortedByCurrentVal = query.sortBy === val;

  return (
    <button onClick={() => {
      if (!sortedByCurrentVal) {
        setQuery({ sortBy: val, sortDesc: true });
      } else {
        setQuery({ sortDesc: !query.sortDesc });
      }
    }} className="group inline-flex">

      {label}
      {sortedByCurrentVal && (
        <span className="ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200">
          {query.sortDesc && <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />}
          {!query.sortDesc && <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />}
        </span>
      )}

    </button>
  );
}
