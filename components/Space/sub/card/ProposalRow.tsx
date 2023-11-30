import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import { classNames } from "@/utils/functions/tailwind";
import ProposalBadgeLabel from "./ProposalBadgeLabel";
import { Proposal } from "@/models/NanceTypes";
import { SpaceContext } from "@/context/SpaceContext";
import { useContext } from "react";

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

  return (
    <tr
      className="hover:cursor-pointer hover:bg-slate-100"
      onClick={() => {
        window.location.href = proposalUrl;
      }}
    >
      <td
        className={classNames(
          isFirst ? "" : "border-t border-transparent",
          "relative hidden py-4 pl-6 pr-3 text-sm md:table-cell",
        )}
      >
        <ProposalBadgeLabel status={status} />

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
            <ProposalBadgeLabel status={status} />
          </div>
          <span className="flex space-x-1 text-xs">
            <span>{proposalTitle}</span>
            <FormattedAddress address={authorAddress} minified />
          </span>

          <p className="break-words text-base text-black">{title}</p>

          <div className="md:hidden">{votesBar}</div>
        </div>
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden px-3 py-3.5 text-center text-sm text-gray-500 md:table-cell",
        )}
      >
        {votesBar}
      </td>
      <td
        className={classNames(
          isFirst ? "" : "border-t border-gray-200",
          "hidden px-3 py-3.5 text-center text-sm text-gray-500 md:table-cell",
        )}
      >
        {votes}
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
