import { DocumentTextIcon, ArchiveIcon } from '@heroicons/react/solid'
import { SnapshotProposal, SnapshotVotedData } from '../hooks/snapshot/Proposals'
import { fromUnixTime, formatDistanceToNow } from 'date-fns'
import { Tooltip } from 'flowbite-react';
import VotingModal from './VotingModal';
import { useContext, useState } from 'react';
import Link from 'next/link';
import { SpaceContext } from '../pages/snapshot/[space]';
import Pagination, { PaginationProps } from './Pagination';

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

export default function ProposalCards({proposals, paginationProp}: {proposals: SnapshotProposal[], paginationProp: PaginationProps}) {
  const [votingProposal, setVotingProposal] = useState(undefined);
  const {address, space: spaceId} = useContext(SpaceContext);

  return (
    <>
      <ul role="list" className="grid grid-cols-1 gap-6 max-w-7xl">
        {proposals.map((proposal) => (
          <ProposalCardItem proposal={proposal} setVotingProposal={setVotingProposal} />
        ))}
      </ul>

      <Pagination {...paginationProp} />

      <VotingModal 
        modalIsOpen={votingProposal !== undefined} 
        closeModal={() => setVotingProposal(undefined)} 
        address={address} 
        spaceId={spaceId} 
        proposal={votingProposal} />
    </>
  )
}

function ProposalCardItem({ proposal, setVotingProposal }: {proposal: SnapshotProposal, setVotingProposal: (proposal: SnapshotProposal) => void}) {
  const {votedData, space: spaceId, address} = useContext(SpaceContext);

  const scores = 
    proposal.scores
      .filter((score) => score>0)
      .map((score, index) => {return { score, index }})
      // sort by score desc
      .sort((a, b) => b.score - a.score)
  const moreThanThreeScores = scores.length > 3;
  const topScores = scores.slice(0, 3);

  return (
    <li key={proposal.id} className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
      <div className="w-full flex items-center justify-between p-6 space-x-6">
        <div className="flex-1 overflow-hidden">
          <div className="flex break-words justify-between flex-col md:flex-row">
            <h3 className="text-gray-900 text-xl font-medium">{proposal.title}</h3>
            <div className="flex items-center space-x-2 break-words">
              {/* Voted status */}
              <div className='min-w-fit'>
                {votedData[proposal.id] && labelWithTooltip('Voted', `You voted ${votedData[proposal.id].choice} with ${formatNumber(votedData[proposal.id].vp)} (${(votedData[proposal.id].vp*100/proposal.scores_total).toFixed()}% of total votes) [Reason: ${votedData[proposal.id].reason}]`, 'text-blue-800 bg-blue-100')}
              </div>

              {/* Proposal status */}
              <div className='min-w-fit'>
                {proposal.state === 'active' && labelWithTooltip('Active', 'Ends ' + formatDistanceToNow(fromUnixTime(proposal.end), { addSuffix: true }), 'text-green-800 bg-green-100')}
                {proposal.state === 'pending' && labelWithTooltip('Pending', 'This proposal is currently pending and not open for votes.', 'text-yellow-800 bg-yellow-100')}
                {proposal.state === 'closed' && labelWithTooltip('Closed', formatDistanceToNow(fromUnixTime(proposal.end), { addSuffix: true }), 'text-gray-800 bg-gray-100')}
              </div>
              
              {/* Under quorum status */}
              {proposal.quorum != 0 && proposal.scores_total < proposal.quorum && (
                <div className='min-w-fit'>
                {labelWithTooltip('Under quorum', `${formatNumber(proposal.scores_total)} (${(proposal.scores_total*100/proposal.quorum).toFixed()}% of quorum)`, 'text-purple-800 bg-purple-100')}
                </div>
              )}
            </div>
          </div>
          <p className="mt-1 text-gray-500 text-sm break-words line-clamp-5 lg:line-clamp-3">{proposal.body}</p>
        </div>
      </div>
      {proposal.scores_total > 0 && (
      <div className="w-full">
        {moreThanThreeScores && (<p className="p-3 text-gray-500">Top 3 choices</p>)}
        <dl className="m-2 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Vote choice data */}
          {topScores.map(({score, index}) => (
            <div key={`${proposal.id}-${index}`} className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <Tooltip
                content={proposal.choices[index]}
                trigger="hover"
              >
                <dt className="text-sm font-medium text-gray-500 truncate">{proposal.choices[index]}</dt>
              </Tooltip>
              <Tooltip
                  content={formatNumber(score)}
                  trigger="hover"
              >
                <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{(score*100/proposal.scores_total).toFixed(2)}%</dd>
              </Tooltip>
            </div>
          ))}
        </dl>
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
              className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500"
            >
              <ArchiveIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
              {(proposal.state !== 'active' || !address) ? (
                <Tooltip trigger="hover" content={proposal.state !== 'active' ? "Proposal is not active" : !address ? "You haven't connected wallet" : "Proposal is active and you can vote on it"}>
                  <span className="ml-3">{votedData[proposal.id] ? "Revote" : "Vote"}</span>
                </Tooltip>
              ) : (<span className="ml-3">{votedData[proposal.id] ? "Revote" : "Vote"}</span>)}
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}