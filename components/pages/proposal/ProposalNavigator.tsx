import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { useProposal } from "../../../hooks/NanceHooks";
import { ProposalCommonProps, ProposalContext } from "../../../pages/s/[space]/[proposal]";

export default function ProposalNavigator() {
  // pre load prev and next proposal
  let { commonProps } = useContext(ProposalContext);
  commonProps = commonProps as ProposalCommonProps;

  const proposalId = commonProps.proposalId;

  const { data: prevProp } = useProposal({ space: commonProps.space, hash: (proposalId - 1).toString() }, !!proposalId);
  const { data: nextProp } = useProposal({ space: commonProps.space, hash: (proposalId + 1).toString() }, !!proposalId);

  return (
    <div className="flex flex-col space-y-2 space-x-0 md:flex-row md:space-y-0 md:space-x-4 justify-between text-gray-500">
      {prevProp?.data?.title && (
        <a href={`/s/${commonProps.space}/${proposalId - 1}`} className="w-full md:w-1/2">
          <ArrowLeftCircleIcon className="h-5 w-5 inline" /> {prevProp?.data?.title}
        </a>
      )}

      {nextProp?.data?.title && (
        <a href={`/s/${commonProps.space}/${proposalId + 1}`} className="w-full md:w-1/2">
          <ArrowRightCircleIcon className="h-5 w-5 inline" /> {nextProp?.data?.title}
        </a>
      )}
    </div>
  );
}
