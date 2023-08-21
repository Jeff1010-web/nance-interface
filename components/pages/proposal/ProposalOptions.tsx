import { Tooltip } from "flowbite-react";
import { SnapshotProposal, useProposalVotes } from "../../../hooks/snapshot/Proposals";
import { formatNumber } from "../../../libs/NumberFormatter";

// BasicVoting: For Against Abstain
const SUPPORTED_VOTING_TYPES_FOR_GROUP = ["basic", "single-choice", "approval"];

export default function ProposalOptions({ proposal, isOverview = false }:
  { proposal: SnapshotProposal, isOverview?: boolean }) {

  const { loading, data, error } = useProposalVotes(proposal, 0, "created", "", isOverview, proposal.votes);

  let scores = proposal?.scores
    ?.map((score, index) => {
      return { score, index }; 
    })
    .filter((o) => o.score > 0)
    // sort by score desc
    .sort((a, b) => b.score - a.score);

  const displayVotesByGroup = SUPPORTED_VOTING_TYPES_FOR_GROUP.includes(proposal.type);
  let votesGroupByChoice: { [choice: string]: number } = {};
  if (!isOverview && displayVotesByGroup) {
    // iterate votesData and group by choice
    votesGroupByChoice = data?.votesData.reduce((acc: { [choice: string]: number }, vote) => {
      const choice = vote.choice;
      if (!acc[choice]) {
        acc[choice] = 0;
      }
      acc[choice]++;
      return acc;
    }, {});
  }

  return (
    <dl className="m-2 grid grid-cols-1 gap-5">
      {/* Vote choice data */}
      {!isOverview && proposal.scores_total > 0 &&
        scores.map(({ score, index }) => (
          <div key={index} className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
            <Tooltip
              content={proposal?.choices[index]}
              trigger="hover"
            >
              <dt className="text-sm font-medium text-gray-500 truncate">{proposal?.choices[index]}</dt>
            </Tooltip>
            <Tooltip
              content={`${(score * 100 / proposal.scores_total).toFixed(2)}%`}
              trigger="hover"
            >
              {/* <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{(proposal.voteByChoice[choice]*100/proposal.scores_total).toFixed(2)}%</dd> */}
              <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">
                {formatNumber(score)}
              </dd>
              {displayVotesByGroup && (
                <span className="text-sm font-medium text-gray-500">
                  {votesGroupByChoice?.[proposal?.choices[index]] ?? 0} votes
                </span>
              )}
              {!displayVotesByGroup && (
                <span className="text-sm font-medium text-gray-500">
                  {(score * 100 / proposal.scores_total).toFixed()}%
                </span>
              )}

            </Tooltip>
          </div>
        ))}
    </dl>
  );
}