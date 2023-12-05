import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import { classNames } from "@/utils/functions/tailwind";
import ProposalBadgeLabel from "./ProposalBadgeLabel";
import { Proposal } from "@/models/NanceTypes";
import { SpaceContext } from "@/context/SpaceContext";
import { useContext } from "react";
import Link from "next/link";
import { format } from "date-fns";

export default function ProposalRow({
  proposal,
  isFirst = false,
  isDraft = false,
  proposalIdPrefix,
  votesBar = <></>,
  voteActionOrStatus = <></>,
}: {
  proposal: Pick<
    Proposal,
    | "hash"
    | "proposalId"
    | "governanceCycle"
    | "status"
    | "authorAddress"
    | "title"
    | "voteResults"
    | "date"
  >;
  isFirst?: boolean;
  isDraft?: boolean;
  proposalIdPrefix?: string;
  votesBar?: JSX.Element;
  voteActionOrStatus?: JSX.Element;
}) {
  const spaceInfo = useContext(SpaceContext);

  const { proposalId, hash, governanceCycle, status, authorAddress, title } =
    proposal;

  const votes = proposal.voteResults?.votes || "-";
  const proposalUrl = `/s/${spaceInfo?.name}/${proposalId || hash}`;
  const proposalTitle = isDraft
    ? "Draft - by "
    : `GC-${governanceCycle}, ${proposalIdPrefix}${proposalId || "tbd"} - by `;
  const proposalDate = proposal.date ? format(new Date(proposal?.date), "MM/dd/yy") : "";

  return (
    <tr className="hover:bg-slate-100">
      <td
        className={classNames(
          isFirst ? "" : "border-t border-transparent",
          "relative hidden text-sm md:table-cell",
        )}
      >
        <Link href={proposalUrl}>
          <div className="py-7 pl-6 pr-3">
            <ProposalBadgeLabel status={status} />
          </div>
        </Link>

        {!isFirst ? (
          <div className="absolute -top-px left-6 right-0 h-px bg-gray-200" />
        ) : null}
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "text-sm text-gray-500",
        )}
      >
        <Link href={proposalUrl}>
          <div className="flex flex-col space-y-1 px-3 py-3.5 max-w-md">
            <div className="block text-gray-900 md:hidden">
              <ProposalBadgeLabel status={status} />
            </div>
            <span className="flex space-x-1 text-xs">
              <span>{proposalTitle}</span>
              <FormattedAddress address={authorAddress} minified />
            </span>

            <p className="break-words text-base text-black">{title}</p>

            <div className="md:hidden">{votesBar}</div>
          </div>
        </Link>
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden text-left text-sm text-gray-500 md:table-cell",
        )}>
        <Link href={proposalUrl}>
          <div className="py-3.5 text-xs text-left text-gray-500 md:table-cell">
            {proposalDate}
          </div>
        </Link>
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden text-center text-sm text-gray-500 md:table-cell",
        )}
      >
        <Link href={proposalUrl}>
          <div className="px-3 py-8">{votesBar}</div>
        </Link>
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden text-center text-sm text-gray-500 md:table-cell",
        )}
      >
        <Link href={proposalUrl}>
          <div className="px-3 py-7">{votes}</div>
        </Link>
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden px-3 py-3.5 text-center text-sm text-gray-500 md:table-cell",
        )}
      >
        {voteActionOrStatus}
      </td>
    </tr>
  );
}
