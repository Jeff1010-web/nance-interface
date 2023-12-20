import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import { ProposalContext } from "./context/ProposalContext";
import { getProposalNumber } from "@/utils/functions/ProposalIdNumber";

export default function ProposalNavigator() {
  // pre load prev and next proposal
  let { commonProps, nextProposalId } = useContext(ProposalContext);

  const proposalNumber = getProposalNumber(commonProps.proposalId);

  return (
    <div className="flex flex-col justify-between space-x-0 space-y-2 text-gray-500 md:flex-row md:space-x-4 md:space-y-0">
      {proposalNumber > 1 && (
        <a
          href={`/s/${commonProps.space}/${proposalNumber - 1}`}
          className="w-full md:w-1/2"
        >
          <ArrowLeftCircleIcon className="inline h-5 w-5" />{" "}
          previous proposal
        </a>
      )}

      {proposalNumber !== nextProposalId - 1 && (
        <a
          href={`/s/${commonProps.space}/${proposalNumber + 1}`}
          className="w-full md:w-1/2"
        >
          <ArrowRightCircleIcon className="inline h-5 w-5" />{" "}
          next proposal
        </a>
      )}
    </div>
  );
}
