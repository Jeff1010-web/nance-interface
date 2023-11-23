import { classNames } from "@/utils/functions/tailwind";
import ProposalBadgeLabel from "./ProposalBadgeLabel";
import ColorBar from "@/components/common/ColorBar";

export default function ProposalRowSkeleton({
  isFirst = false,
}: {
  isFirst?: boolean;
}) {
  return (
    <tr className="hover:cursor-pointer hover:bg-slate-100">
      <td
        className={classNames(
          isFirst ? "" : "border-t border-transparent",
          "relative hidden py-4 pl-6 pr-3 text-sm md:table-cell",
        )}
      >
        <ProposalBadgeLabel status="" />

        {!isFirst ? (
          <div className="absolute -top-px left-6 right-0 h-px bg-gray-200" />
        ) : null}
      </td>

      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "px-3 py-3.5 text-sm text-gray-500",
        )}
      >
        <div className="flex flex-col space-y-1">
          <div className="block text-gray-900 md:hidden">
            <ProposalBadgeLabel status="" />
          </div>
          {/* cycle metadata */}
          <span className="h-4 w-20 animate-pulse rounded bg-slate-200 text-xs"></span>
          {/* proposal title */}
          <p className="h-6 w-32 animate-pulse break-words rounded bg-slate-200 text-base text-black"></p>

          <div className="md:hidden">
            <ColorBar greenScore={0} redScore={0} />
          </div>
        </div>
      </td>

      {/* VotesBar */}
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden px-3 py-3.5 text-sm text-gray-500 md:table-cell",
        )}
      >
        <ColorBar greenScore={0} redScore={0} noTooltip />
      </td>

      {/* Votes */}
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden px-3 py-3.5 text-center text-sm text-black md:table-cell",
        )}
      >
        <div className="flex justify-center">
          <p className="h-6 w-6 animate-pulse rounded-full bg-slate-200"></p>
        </div>
      </td>

      {/* VotedStatus or NewVoteButton */}
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden px-3 py-3.5 text-center text-sm text-gray-500 md:table-cell",
        )}
      >
        <div className="flex justify-center">
          <p className="h-6 w-16 animate-pulse rounded bg-slate-200"></p>
        </div>
      </td>
    </tr>
  );
}
