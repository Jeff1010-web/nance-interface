import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useProposalsByID, SnapshotProposal } from "../../hooks/snapshot/Proposals";
import { getLastSlash } from "../../libs/nance";
import { Proposal, ProposalsPacket } from "../../models/NanceTypes";
import FormattedAddress from "../FormattedAddress";
import { classNames } from "../../libs/tailwind";
import { Tooltip } from "flowbite-react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon, InformationCircleIcon, PencilSquareIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNowStrict, toDate } from "date-fns";
import ColorBar from "../ColorBar";

type SortOptions = "" | "status" | "title" | "approval" | "participants" | "voted"
const SortOptionsArr = ["status", "title", "approval", "participants", "voted"]
const StatusValue = {
    'Revoked': 0,
    'Cancelled': 1,
    'Draft': 2,
    'Discussion': 2,
    'Voting': 3,
    'Approved': 4,
    'Implementation': 5,
    'Finished': 6
}
function getValueOfStatus(status: string) {
    return StatusValue[status] ?? -1;
}
function getVotedIcon(choice) {
    if (choice === undefined) {
      return null
    } else if (typeof choice === 'string') {
      if (choice === 'For' || choice === 'Yes') {
        return <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
      } else if (choice === 'Against' || choice === 'No') {
        return <XMarkIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
      }
    }
  
    return (
      <Tooltip content={JSON.stringify(choice)}>
        <InformationCircleIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
      </Tooltip>
    )
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export default function ProposalCards({ loading, proposalsPacket, query, setQuery, maxCycle, proposalUrlPrefix }:
    {
      loading: boolean, proposalsPacket: ProposalsPacket,
      query: { cycle: number, keyword: string, sortBy: string, sortDesc: boolean },
      setQuery: (o: object) => void, maxCycle: number,
      proposalUrlPrefix: string
    }) {
    const router = useRouter();
    const [infoText, setInfoText] = useState('');
    const { address, isConnected } = useAccount();
  
    // for those proposals with no results cached by nance, we need to fetch them from snapshot
    const snapshotProposalIds: string[] = proposalsPacket?.proposals?.filter(p => p.voteURL).map(p => getLastSlash(p.voteURL)) || [];
    const { data, loading: snapshotLoading, error } = useProposalsByID(snapshotProposalIds, address, snapshotProposalIds.length === 0);
    // convert proposalsData to dict with proposal id as key
    const snapshotProposalDict: { [id: string]: SnapshotProposal } = {};
    data?.proposalsData?.forEach(p => snapshotProposalDict[p.id] = p);
    // override the snapshot proposal vote results into proposals.voteResults
    const mergedProposals: Proposal[] = proposalsPacket?.proposals?.map(p => {
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
    let sortedProposals = mergedProposals?.sort((a, b) => b.governanceCycle - a.governanceCycle) || []
    if (!query.sortBy || !SortOptionsArr.includes(query.sortBy)) {
      // fall back to default sorting
      sortedProposals
        .sort((a, b) => (b.voteResults?.votes ?? 0) - (a.voteResults?.votes ?? 0))
        .sort((a, b) => getValueOfStatus(b.status) - getValueOfStatus(a.status))
    } else {
      if (query.sortBy === "status") {
        sortedProposals.sort((a, b) => getValueOfStatus(b.status) - getValueOfStatus(a.status))
      } else if (query.sortBy === "approval") {
        const sumScores = (p: Proposal) => {
          return (p?.voteResults?.scores ?? []).reduce((partialSum, a) => partialSum + a, 0)
        }
        sortedProposals.sort((a, b) => sumScores(b) - sumScores(a))
      } else if (query.sortBy === "participants") {
        sortedProposals.sort((a, b) => (b.voteResults?.votes ?? 0) - (a.voteResults?.votes ?? 0))
      } else if (query.sortBy === "voted") {
        const votedWeightOf = (p: Proposal) => votedData?.[getLastSlash(p.voteURL)] !== undefined ? 1 : -1
        sortedProposals.sort((a, b) => votedWeightOf(b) - (votedWeightOf(a)))
      } else {
        sortedProposals.sort()
      }
  
      if (!query.sortDesc) {
        sortedProposals.reverse()
      }
    }
  
    useEffect(() => {
      if (loading) {
        setInfoText('Loading...');
      } else {
        if (!proposalsPacket?.proposals) {
          setInfoText('Error. Please try again later.');
        } else if (proposalsPacket?.proposals.length === 0) {
          setInfoText('No proposals found, try below actions:');
        } else {
          setInfoText('');
        }
      }
    }, [proposalsPacket?.proposals, loading]);
  
    function SortableTableHeader({ val, label }: { val: SortOptions, label: string }) {
      const sortedByCurrentVal = query.sortBy === val
  
      return (
        <button onClick={() => {
          if (!sortedByCurrentVal) {
            setQuery({ sortBy: val, sortDesc: true })
          } else {
            setQuery({ sortDesc: !query.sortDesc })
          }
        }} className="group inline-flex">
  
          {label}
          {sortedByCurrentVal && (
            <span className="ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200">
              {query.sortDesc && <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />}
              {!query.sortDesc && <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />}
            </span>
          )}
  
        </button>
      )
    }
  
    return (
      <>
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
                  <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 md:table-cell">
                    <SortableTableHeader val="voted" label="Voted" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedProposals.map((proposal, proposalIdx) => (   
                  <tr key={proposal.hash} className="hover:bg-slate-100">
                    <td
                      className={classNames(
                        proposalIdx === 0 ? '' : 'border-t border-transparent',
                        'relative py-4 pl-6 pr-3 text-sm hidden md:table-cell'
                      )}
                    >
                      <div className="font-medium text-gray-900">
                        {(proposal.status === 'Discussion' || proposal.status === 'Draft' || proposal.status === 'Revoked') && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {proposal.status}
                          </span>
                        )}
                        {proposal.status === 'Approved' && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                        )}
                        {proposal.status === 'Cancelled' && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Cancelled
                          </span>
                        )}
                        {(proposal.status !== 'Discussion' && proposal.status !== 'Approved' && proposal.status !== 'Cancelled' && proposal.status !== 'Draft' && proposal.status !== 'Revoked') && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {proposal.status}
                          </span>
                        )}
                      </div>
  
                      {proposalIdx !== 0 ? <div className="absolute right-0 left-6 -top-px h-px bg-gray-200" /> : null}
                    </td>
                    <td
                      className={classNames(
                        proposalIdx === 0 ? '' : 'border-t border-gray-200',
                        'px-3 py-3.5 text-sm text-gray-500'
                      )}
                    >
                      <div className="flex flex-col space-y-1">
                        <div className="text-gray-900 block md:hidden">
                          {(proposal.status === 'Discussion' || proposal.status === 'Draft' || proposal.status === 'Revoked') && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {proposal.status}
                            </span>
                          )}
                          {proposal.status === 'Approved' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Approved
                            </span>
                          )}
                          {proposal.status === 'Cancelled' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Cancelled
                            </span>
                          )}
                          {(proposal.status !== 'Discussion' && proposal.status !== 'Approved' && proposal.status !== 'Cancelled' && proposal.status !== 'Draft' && proposal.status !== 'Revoked') && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              {proposal.status}
                            </span>
                          )}
                        </div>
                        <span className="text-xs">
                          {`GC-${proposal.governanceCycle}, ${proposalsPacket.proposalInfo.proposalIdPrefix}${proposal.proposalId || "tbd"} - by `}
                          <FormattedAddress address={proposal.authorAddress} noLink />
                        </span>
  
                        <Link href={`${proposalUrlPrefix}${proposal.proposalId || proposal.hash}`} legacyBehavior>
                          <a className="break-words text-base text-black">
                            {proposal.title}
                          </a>
                        </Link>
                      </div>
  
                    </td>
                    <td
                      className={classNames(
                        proposalIdx === 0 ? '' : 'border-t border-gray-200',
                        'hidden px-3 py-3.5 text-sm text-gray-500 md:table-cell'
                      )}
                    >
                      <VotesBar proposal={proposal} snapshotProposal={snapshotProposalDict[getLastSlash(proposal.voteURL)]} />
                    </td>
                    <td
                      className={classNames(
                        proposalIdx === 0 ? '' : 'border-t border-gray-200',
                        'hidden px-3 py-3.5 text-sm text-black md:table-cell text-center'
                      )}
                    >
                      {proposal?.voteResults?.votes || '-'}
                    </td>
                    <td
                      className={classNames(
                        proposalIdx === 0 ? '' : 'border-t border-gray-200',
                        'px-3 py-3.5 text-sm text-gray-500 hidden md:table-cell text-center'
                      )}
                    >
                      {getVotedIcon(votedData?.[getLastSlash(proposal.voteURL)]?.choice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  
        <p className="text-center m-6">
          {infoText}
        </p>
  
        {!loading && proposalsPacket?.proposals?.length === 0 && (
          <div className="flex flex-col items-center space-y-4 mb-6">
            <button type="button"
              className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
              onClick={router.back}>
              Back to previous page
            </button>
  
            {
              query.keyword && (
                <button type="button"
                  className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
                  onClick={() => setQuery({ keyword: '' })}>
                  Clear the keyword
                </button>
              )
            }
  
            {
              query.keyword && query.cycle && (
                <button type="button"
                  className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
                  onClick={() => setQuery({ cycle: undefined })}>
                  Search in all cycles
                </button>
              )
            }
  
            {
              !query.keyword && query.cycle && (
                <button type="button"
                  className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
                  onClick={() => setQuery({ cycle: getRandomInt(maxCycle) + 1 })}>
                  Check different cycle
                </button>
              )
            }
  
          </div>
        )}
      </>
    )
}

function VotingTimeIndicator({p}: {p: SnapshotProposal}) {
    if (!p) return null
  
    const currentTime = Math.floor(Date.now() / 1000)
    const startLabel = formatDistanceToNowStrict(toDate(p.start * 1000), { addSuffix: true })
    const endLabel = formatDistanceToNowStrict(toDate(p.end * 1000), { addSuffix: true })

    if (currentTime < p.start) {
      return (
        <div className="flex space-x-1 text-xs justify-center place-items-center">
          <PencilSquareIcon className="h-3 w-3" />
          <p>{startLabel}</p>
        </div>
      )
    } else if (currentTime >= p.start && currentTime <= p.end) {
      return (
        <div className="flex space-x-1 text-xs justify-center place-items-center">
          <ClockIcon className="h-3 w-3" />
          <p>{endLabel}</p>
        </div>
      )
    } else {
      return null
    }
}

function VotesBar({ snapshotProposal, proposal }: { snapshotProposal: SnapshotProposal, proposal: Proposal }) {
    const hasSnapshotVoting = snapshotProposal !== undefined
  
    if (hasSnapshotVoting) {
      return (
        <div className="flex flex-col space-y-1">
          <VotingTimeIndicator p={snapshotProposal} />
  
          {['approval', 'ranked-choice', 'quadratic', 'weighted'].includes(snapshotProposal?.type) ? (
            // sum all scores to get the total score
            <ColorBar greenScore={snapshotProposal.scores_total || 0} redScore={0} />
          ) : (
            <ColorBar greenScore={proposal?.voteResults?.scores[0] || 0} redScore={proposal?.voteResults?.scores[1] || 0} />
          )
          }
        </div>
      )
    } else {
      return (
        <div className="flex flex-col space-y-1">

          {proposal.status === "Cancelled" && (
            <ColorBar greenScore={proposal?.temperatureCheckVotes?.[0] || 0} redScore={proposal?.temperatureCheckVotes?.[1] || 0} threshold={10} />
          )}

          {proposal.status === "Temperature Check" && (
            <div className="flex space-x-1 text-xs justify-center place-items-center">
              <ClockIcon className="h-3 w-3" />
            </div>
          )}
  
        </div>
      )
    }
}