import { SpaceContext } from "@/context/SpaceContext";
import { usePrivateProposals } from "@/utils/hooks/NanceHooks";
import ProposalRow from "./ProposalRow";
import { useContext } from "react";
import { StringParam, useQueryParams } from "next-query-params";

export default function PrivateProposalRows() {
  const [query, setQuery] = useQueryParams({
    keyword: StringParam,
  });
  const spaceInfo = useContext(SpaceContext);
  const { data } = usePrivateProposals(
    spaceInfo?.name || "",
    spaceInfo?.name !== undefined,
  );

  const { keyword } = query;
  const shouldDisplay = !keyword; // shouldn't display if keyword is specified
  const privateProposals = data?.data;

  if (
    !shouldDisplay ||
    privateProposals === undefined ||
    privateProposals.length <= 0
  ) {
    return null;
  }

  return (
    <>
      {privateProposals?.map((proposal, proposalIdx) => (
        <ProposalRow
          proposal={proposal}
          key={proposalIdx}
          isFirst={proposalIdx === 0}
          isDraft
        />
      ))}

      <tr>
        <td colSpan={6}>
          <hr className="border-2 border-dashed" />
        </td>
      </tr>
    </>
  );
}
