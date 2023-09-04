import { BooleanParam, NumberParam, StringParam, useQueryParams, withDefault } from "next-query-params";
import router from "next/router";

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export default function RecommendAction({ maxCycle }: { maxCycle: number }) {
  const [query, setQuery] = useQueryParams({
    keyword: StringParam,
    limit: withDefault(NumberParam, 15),
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(StringParam, ''),
    sortDesc: withDefault(BooleanParam, true),
    cycle: NumberParam
  });

  return (
    <>
      <p className="text-center m-6">
        No proposals found, try below actions
      </p>

      <div className="flex flex-col items-center space-y-4 mb-6">
        <button type="button"
          className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
          onClick={router.back}>
          Back
        </button>

        {
          query.page && query.page > 1 && (
            <button type="button"
              className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
              onClick={() => setQuery({ page: 1 })}>
              Go to first page
            </button>
          )
        }

        {
          query.keyword && (
            <button type="button"
              className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
              onClick={() => setQuery({ keyword: '' })}>
              Clear the keyword
            </button>
          )
        }

        {
          query.keyword && query.cycle && (
            <button type="button"
              className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
              onClick={() => setQuery({ cycle: undefined })}>
              Search in all cycles
            </button>
          )
        }

        {
          !query.keyword && query.cycle && (
            <button type="button"
              className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
              onClick={() => setQuery({ cycle: getRandomInt(maxCycle) + 1 })}>
              Check different cycle
            </button>
          )
        }

      </div>
    </>
  );
}
