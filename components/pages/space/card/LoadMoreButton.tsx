import { classNames } from "../../../../libs/tailwind";
import LoadingArrowSpiner from "../../../LoadingArrowSpiner";

export default function LoadMoreButton(
  { dataLength, fetchMore, loading, hasMore = true }:
    { dataLength: number, fetchMore: any, loading: boolean, hasMore?: boolean }) {

  return (
    <div className="isolate inline-flex rounded-md col-span-4">
      <button
        type="button"
        className={classNames(
          "relative inline-flex items-center gap-x-1.5 rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50",
          loading ? "" : "hover:bg-gray-50 focus:z-10"
        )}
        disabled={loading || !hasMore}
        onClick={fetchMore}
      >
        Load more
      </button>
      <div
        className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300"
      >
        {loading ? <LoadingArrowSpiner /> : dataLength}
      </div>
    </div>
  );
}
