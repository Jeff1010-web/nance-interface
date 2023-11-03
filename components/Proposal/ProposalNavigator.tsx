import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import { useProposal } from "@/utils/hooks/NanceHooks";
import { ProposalContext } from "./context/ProposalContext";

export default function ProposalNavigator() {
  // pre load prev and next proposal
  let { commonProps } = useContext(ProposalContext);

  const proposalId = commonProps.proposalId;

  const { data: prevProp } = useProposal(
    { space: commonProps.space, hash: (proposalId - 1).toString() },
    !!proposalId,
  );
  const { data: nextProp } = useProposal(
    { space: commonProps.space, hash: (proposalId + 1).toString() },
    !!proposalId,
  );

  return (
    <div className="flex flex-col justify-between space-x-0 space-y-2 text-gray-500 md:flex-row md:space-x-4 md:space-y-0">
      {prevProp?.data?.title && (
        <a
          href={`/s/${commonProps.space}/${proposalId - 1}`}
          className="w-full md:w-1/2"
        >
          <ArrowLeftCircleIcon className="inline h-5 w-5" />{" "}
          {prevProp?.data?.title}
        </a>
      )}

      {nextProp?.data?.title && (
        <a
          href={`/s/${commonProps.space}/${proposalId + 1}`}
          className="w-full md:w-1/2"
        >
          <ArrowRightCircleIcon className="inline h-5 w-5" />{" "}
          {nextProp?.data?.title}
        </a>
      )}
    </div>
  );
}
