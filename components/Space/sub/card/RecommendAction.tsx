import {
  BooleanParam,
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from "next-query-params";
import router from "next/router";

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export default function RecommendAction({
  maxCycle,
  clearKeywordInput,
}: {
  maxCycle: number;
  clearKeywordInput: () => void;
}) {
  const [query, setQuery] = useQueryParams({
    keyword: StringParam,
    page: withDefault(NumberParam, 1),
    cycle: withDefault(StringParam, "All"),
  });

  return (
    <>
      <p className="m-6 text-center">No proposals found, try below actions</p>

      <div className="mb-6 flex flex-col items-center space-y-4">
        <button
          type="button"
          className="w-1/2 items-center rounded border border-transparent bg-[#0E76FD] px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
          onClick={router.back}
        >
          Back to previous page
        </button>

        {query.page && query.page > 1 && (
          <button
            type="button"
            className="w-1/2 items-center rounded border border-transparent bg-[#0E76FD] px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
            onClick={() => setQuery({ page: 1 })}
          >
            Go to first page
          </button>
        )}

        {query.keyword && (
          <button
            type="button"
            className="w-1/2 items-center rounded border border-transparent bg-[#0E76FD] px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
            onClick={() => {
              clearKeywordInput();
            }}
          >
            Clear the keyword
          </button>
        )}

        {query.keyword && query.cycle && query.cycle !== "All" && (
          <button
            type="button"
            className="w-1/2 items-center rounded border border-transparent bg-[#0E76FD] px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
            onClick={() => setQuery({ cycle: "All" })}
          >
            Search in all cycles
          </button>
        )}

        {!query.keyword && query.cycle && (
          <button
            type="button"
            className="w-1/2 items-center rounded border border-transparent bg-[#0E76FD] px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
            onClick={() =>
              setQuery({ cycle: (getRandomInt(maxCycle) + 1).toString() })
            }
          >
            Check different cycle
          </button>
        )}
      </div>
    </>
  );
}
