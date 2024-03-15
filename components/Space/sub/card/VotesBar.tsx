import ColorBar, { JB_THRESHOLD } from "@/components/common/ColorBar";
import { SnapshotProposal } from "@/models/SnapshotTypes";
import { Proposal } from "@/models/NanceTypes";
import { ClockIcon, BoltIcon } from "@heroicons/react/24/solid";
import VotingTimeIndicator from "./VotingTimeIndicator";
import { STATUS } from "@/constants/Nance";

export default function VotesBar({
  snapshotProposal,
  proposal,
  threshold = JB_THRESHOLD,
}: {
  snapshotProposal: SnapshotProposal;
  proposal: Proposal;
  threshold?: number;
}) {
  const hasSnapshotVoting = snapshotProposal !== undefined;

  if (hasSnapshotVoting) {
    const { start, end, type, scores_total } = snapshotProposal;
    return (
      <div className="flex flex-col space-y-1">
        <VotingTimeIndicator start={start} end={end} />
        {scores_total < threshold && proposal.status === STATUS.VOTING && (
          <div className="flex flex-row justify-center items-center text-[11px] text-orange-500">
            <BoltIcon className="h-4 w-4" />
            under quorum!
          </div>
        )}

        {["approval", "ranked-choice", "quadratic", "weighted"].includes(
          type,
        ) ? (
          // sum all scores to get the total score
            <ColorBar
              greenScore={scores_total || 0}
              redScore={0}
              threshold={threshold}
            />
          ) : (
            <ColorBar
              greenScore={proposal?.voteResults?.scores[0] || 0}
              redScore={proposal?.voteResults?.scores[1] || 0}
              threshold={threshold}
            />
          )}
      </div>
    );
  } else {
    return (
      <div className="flex flex-col space-y-1">
        {proposal.status === "Cancelled" && (
          <ColorBar
            greenScore={proposal?.temperatureCheckVotes?.[0] || 0}
            redScore={proposal?.temperatureCheckVotes?.[1] || 0}
            threshold={10}
          />
        )}

        {proposal.status === "Temperature Check" && (
          <div className="flex place-items-center justify-center space-x-1 text-xs">
            <ClockIcon className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  }
}
