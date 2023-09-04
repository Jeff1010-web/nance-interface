import { useAccount } from "wagmi";
import { useProposalsByID, SnapshotProposal } from "../../../hooks/snapshot/Proposals";
import { getLastSlash } from "../../../libs/nance";
import { Proposal, ProposalsPacket } from "../../../models/NanceTypes";
import ProposalRow, { ProposalRowSkeleton } from "./card/ProposalRow";
import ProposalPrivateRow from "./card/ProposalPrivateRow";
import RecommendAction from "./RecommendAction";
import SortableTableHeader from "./SortableTableHeader";

const SortOptionsArr = ["status", "title", "approval", "participants", "voted"];
const StatusValue: { [key: string]: number } = {
  'Revoked': 0,
  'Cancelled': 1,
  'Draft': 2,
  'Discussion': 2,
  'Voting': 3,
  'Approved': 4,
  'Implementation': 5,
  'Finished': 6
};
function getValueOfStatus(status: string) {
  return StatusValue[status] ?? -1;
}

export default function ProposalCards({ loading, proposalsPacket, query, setQuery, maxCycle, proposalUrlPrefix, showDrafts }:
  {
    loading: boolean, proposalsPacket: ProposalsPacket | undefined,
    query: { cycle: number, keyword: string, sortBy: string, sortDesc: boolean, page: number, limit: number },
    setQuery: (o: object) => void, maxCycle: number,
    proposalUrlPrefix: string,
    showDrafts: boolean
  }) {
  const { address, isConnected } = useAccount();

  // for those proposals with no results cached by nance, we need to fetch them from snapshot
  const snapshotProposalIds: string[] = proposalsPacket?.proposals?.filter(p => p.voteURL).map(p => getLastSlash(p.voteURL)) || [];
  const { data, loading: snapshotLoading, error, refetch } = useProposalsByID(snapshotProposalIds, address ?? "", snapshotProposalIds.length === 0);
  // convert proposalsData to dict with proposal id as key
  const snapshotProposalDict: { [id: string]: SnapshotProposal } = {};
  data?.proposalsData?.forEach(p => snapshotProposalDict[p.id] = p);
  // override the snapshot proposal vote results into proposals.voteResults
  const mergedProposals = proposalsPacket?.proposals?.map(p => {
    const snapshotProposal = snapshotProposalDict[getLastSlash(p.voteURL)];
    if (snapshotProposal) {
      return {
        ...p, voteResults: {
          choices: snapshotProposal.choices,
          scores: snapshotProposal.scores,
          votes: snapshotProposal.votes
        }
      };
    } else {
      return p;
    }
  });
  const votedData = data?.votedData;
  // sort proposals
  // FIXME this can only sort proposals in current page
  let sortedProposals = mergedProposals || [];
  if (!query.sortBy || !SortOptionsArr.includes(query.sortBy)) {
    if (query.keyword) {
      // keep relevance order
    } else {
      // fall back to default sorting
      // if no keyword
      sortedProposals
        .sort((a, b) => (b.governanceCycle ?? 0) - (a.governanceCycle ?? 0))
        .sort((a, b) => (b.voteResults?.votes ?? 0) - (a.voteResults?.votes ?? 0))
        .sort((a, b) => getValueOfStatus(b.status) - getValueOfStatus(a.status));
    }
  } else {
    if (query.sortBy === "status") {
      sortedProposals.sort((a, b) => getValueOfStatus(b.status) - getValueOfStatus(a.status));
    } else if (query.sortBy === "approval") {
      const sumScores = (p: Proposal) => {
        return (p?.voteResults?.scores ?? []).reduce((partialSum, a) => partialSum + a, 0);
      };
      sortedProposals.sort((a, b) => sumScores(b) - sumScores(a));
    } else if (query.sortBy === "participants") {
      sortedProposals.sort((a, b) => (b.voteResults?.votes ?? 0) - (a.voteResults?.votes ?? 0));
    } else if (query.sortBy === "voted") {
      const votedWeightOf = (p: Proposal) => {
        const voted = votedData?.[getLastSlash(p.voteURL)] !== undefined;
        const hasSnapshotVoting = snapshotProposalDict[getLastSlash(p.voteURL)];

        if (hasSnapshotVoting) {
          if (voted) return 2;
          else return 1;
        } else {
          return 0;
        }
      };
      sortedProposals.sort((a, b) => votedWeightOf(b) - (votedWeightOf(a)));
    } else if (query.sortBy === "title") {
      sortedProposals.sort((a, b) => {
        const nameA = a.title;
        const nameB = b.title;
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      sortedProposals.sort();
    }

    if (!query.sortDesc) {
      sortedProposals.reverse();
    }
  }

  const isLoading = loading || snapshotLoading;
  const hasPrivateProposals = showDrafts && !query.keyword && (proposalsPacket?.privateProposals?.length ?? 0) > 0;

  if (!isLoading && sortedProposals.length === 0) {
    return <RecommendAction maxCycle={maxCycle} />;
  }

  return (
    <div className="mt-6 bg-white">
      <div className="mt-10 ring-1 ring-gray-300 sm:mx-0 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" className="hidden py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 md:table-cell">
                <SortableTableHeader val="status" label="Status" />
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                <SortableTableHeader val="title" label="Title" />
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 md:table-cell"
              >
                <SortableTableHeader val="approval" label="Approval" />
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 md:table-cell"
              >
                <SortableTableHeader val="participants" label="Participants" />
              </th>
              <th scope="col" className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 md:table-cell">
                <SortableTableHeader val="voted" label="Voted" />
              </th>
            </tr>
          </thead>
          <tbody>

            {isLoading && (<>
              <ProposalRowSkeleton isFirst />
              <ProposalRowSkeleton />
              <ProposalRowSkeleton />
            </>)}

            {!isLoading && hasPrivateProposals && (
              <>
                {proposalsPacket?.privateProposals.map((proposal, proposalIdx) => (
                  <ProposalPrivateRow
                    proposal={proposal}
                    key={proposalIdx}
                    proposalIdx={proposalIdx}
                    proposalIdPrefix={proposalsPacket?.proposalInfo?.proposalIdPrefix || ""}
                    proposalUrlPrefix={proposalUrlPrefix}
                  />
                ))}

                <tr>
                  <td colSpan={5}>
                    <hr className="border-dashed border-2" />
                  </td>
                </tr>
              </>
            )}

            {!isLoading && sortedProposals.map((proposal, proposalIdx) => (
              <ProposalRow
                proposal={proposal}
                key={proposalIdx}
                proposalIdx={proposalIdx}
                proposalIdPrefix={proposalsPacket?.proposalInfo?.proposalIdPrefix || ""}
                snapshotSpace={proposalsPacket?.proposalInfo?.snapshotSpace || ""}
                snapshotProposalDict={snapshotProposalDict}
                votedData={votedData}
                proposalUrlPrefix={proposalUrlPrefix}
                refetch={refetch}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
