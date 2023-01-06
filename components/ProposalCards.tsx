import { DocumentTextIcon, ArchiveIcon } from '@heroicons/react/solid'
import { SnapshotProposal } from '../hooks/snapshot/Proposals'
import { fromUnixTime, formatDistanceToNowStrict } from 'date-fns'
import { Tooltip } from 'flowbite-react';
import VotingModal from './VotingModal';
import { useContext, useState } from 'react';
import Link from 'next/link';
import { SpaceContext } from '../pages/snapshot/[space]';
import ProposalStats from './ProposalStats';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

const labelWithTooltip = (label: string, tooltip: string, colors: string) => (
  <Tooltip
    content={tooltip}
    trigger="hover"
  >
    <span className={classNames(
                      colors,
                      "flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full"
                  )}>
      {label}
    </span>
  </Tooltip>
)

export default function ProposalCards({proposals}: {proposals: SnapshotProposal[]}) {
  const {hideAbstain: spaceHideAbstain} = useContext(SpaceContext);
  const [votingProposal, setVotingProposal] = useState(undefined);
  const {address, space: spaceId} = useContext(SpaceContext);

  return (
    <>
      <ul role="list" className="grid grid-cols-1 gap-6 max-w-7xl">
        {proposals.map((proposal) => (
          <ProposalCardItem key={proposal.id} proposal={proposal} setVotingProposal={setVotingProposal} />
        ))}
      </ul>

      <VotingModal 
        modalIsOpen={votingProposal !== undefined} 
        closeModal={() => setVotingProposal(undefined)} 
        address={address} 
        spaceId={spaceId} 
        spaceHideAbstain={spaceHideAbstain}
        proposal={votingProposal} />
    </>
  )
}

function ProposalCardItem({ proposal, setVotingProposal }: {proposal: SnapshotProposal, setVotingProposal: (proposal: SnapshotProposal) => void}) {
  const {votedData, space: spaceId, address, hideAbstain: spaceHideAbstain} = useContext(SpaceContext);
  const reasonStr = (votedData[proposal.id] && votedData[proposal.id].reason !== "") ? ` [Reason: ${votedData[proposal.id].reason}]` : "";

  const hideAbstain = spaceHideAbstain && proposal.type === "basic";
  const totalScore = hideAbstain ? 
    proposal.scores_total-(proposal?.scores[2]??0)
      : proposal.scores_total;

  return (
    <li className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
      <div className="w-full flex items-center justify-between p-6 space-x-6">
        <div className="flex-1 overflow-hidden">
          <div className="flex break-words justify-start">
            <h3 className="text-gray-900 text-xl font-medium">{proposal.title}</h3>
          </div>
          <div className="flex sm:space-x-1 break-words flex-col sm:flex-row">
            {/* Voted status */}
            <div className='min-w-fit'>
              {votedData[proposal.id] && labelWithTooltip(`Voted: ${votedData[proposal.id].choice}`, `You voted ${votedData[proposal.id].choice} with ${formatNumber(votedData[proposal.id].vp)} (${(votedData[proposal.id].vp*100/proposal.scores_total).toFixed()}% of total votes)${reasonStr}`, 'text-blue-800 bg-blue-100')}
            </div>

            {/* Proposal status */}
            <div className='min-w-fit'>
              {proposal.state === 'active' && (
                <span className="text-green-800 bg-green-100 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full">
                  Active for {formatDistanceToNowStrict(fromUnixTime(proposal.end))}
                </span>
              )}
              {proposal.state === 'pending' && labelWithTooltip('Pending', 'This proposal is currently pending and not open for votes.', 'text-yellow-800 bg-yellow-100')}
              {proposal.state === 'closed' && (
                <span className="text-gray-800 bg-gray-100 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full">
                  Closed {formatDistanceToNowStrict(fromUnixTime(proposal.end), { addSuffix: true })}
                </span>
              )}
            </div>
            
            {/* Under quorum status */}
            {proposal.quorum != 0 && totalScore < proposal.quorum && (
              <div className='min-w-fit'>
                <span className="text-purple-800 bg-purple-100 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full">
                  {spaceId === "jbdao.eth" ? "Approval Threshold" : "Under Quorum"}: {(totalScore*100/proposal.quorum).toFixed()}%
                </span>
              </div>
            )}
          </div>
          <p className="mt-1 text-gray-500 text-sm break-words line-clamp-5">{proposal.body}</p>
        </div>
      </div>
      {proposal.scores_total > 0 && (
      <div className="w-full">
        <ProposalStats proposal={proposal} isOverview hideAbstain={hideAbstain} />
      </div>
      )}
      <div>
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="w-0 flex-1 flex">
            <Link href={`/snapshot/${spaceId}/proposal/${proposal.id}`}>
              <a
                className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
              >
                <DocumentTextIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                <span className="ml-3">More</span>
              </a>
            </Link>
          </div>
          <div className="-ml-px w-0 flex-1 flex">
            <button
              disabled={proposal.state !== 'active' || !address}
              onClick={() => setVotingProposal(proposal)}
              className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500 disabled:bg-gray-100"
            >
              <ArchiveIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
              {(proposal.state !== 'active' || !address) ? (
                <Tooltip trigger="hover" content={proposal.state !== 'active' ? "Proposal is not active" : !address ? "You haven't connected wallet" : "Proposal is active and you can vote on it"}>
                  <span className="ml-3">Vote</span>
                </Tooltip>
              ) : (<span className="ml-3">Vote</span>)}
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}