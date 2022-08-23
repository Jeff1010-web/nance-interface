import { ExternalLinkIcon, ArchiveIcon } from '@heroicons/react/solid'
import { ProposalDataExtended, VotesData } from '../hooks/ProposalsExtendedOf'
import { fromUnixTime, formatDistanceToNow, isPast } from 'date-fns'
import { Tooltip } from 'flowbite-react';

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

export default function ProposalCards({spaceId, proposals, votedData}: {spaceId: string, proposals: ProposalDataExtended[], votedData: VotesData}) {

  return (
    <ul role="list" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {proposals.map((proposal) => (
        <li key={proposal.id} className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
          <div className="w-full flex items-center justify-between p-6 space-x-6">
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center space-x-3 break-words">
                <h3 className="text-gray-900 text-xl font-medium">{proposal.title}</h3>
                {/* Proposal status */}
                <div className='min-w-fit'>
                  {proposal.state === 'active' && labelWithTooltip('Active', 'Ends ' + formatDistanceToNow(fromUnixTime(proposal.end), { addSuffix: true }), 'text-green-800 bg-green-100')}
                  {proposal.state === 'pending' && labelWithTooltip('Pending', 'This proposal is currently pending and not open for votes.', 'text-gray-800 bg-gray-100')}
                  {proposal.state === 'closed' && labelWithTooltip('Closed', formatDistanceToNow(fromUnixTime(proposal.end), { addSuffix: true }), 'text-gray-800 bg-gray-100')}
                </div>
                
                {/* Under quorum status */}
                {proposal.quorum != 0 && proposal.scores_total < proposal.quorum && (
                  <div className='min-w-fit'>
                  {labelWithTooltip('Under quorum', `${formatNumber(proposal.scores_total)} (${(proposal.scores_total*100/proposal.quorum).toFixed()}% of quorum)`, 'text-red-800 bg-red-100')}
                  </div>
                )}
              </div>
              <p className="mt-1 text-gray-500 text-sm break-words line-clamp-5">{proposal.body}</p>
            </div>
          </div>
          <div className="w-full">
            <dl className="m-2 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {/* Vote choice data */}
              {proposal.choices.map((choice) => (
                <div key={`${proposal.id}-${choice}`} className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <Tooltip
                    content={choice}
                    trigger="hover"
                  >
                    <dt className="text-sm font-medium text-gray-500 truncate">{choice}</dt>
                  </Tooltip>
                  <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{(proposal.voteByChoice[choice]*100/proposal.scores_total).toFixed()}%</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="w-0 flex-1 flex">
                <a
                  href={`https://snapshot.org/#/${spaceId}/proposal/${proposal.id}`}
                  className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                >
                  <ExternalLinkIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  <span className="ml-3">Snapshot</span>
                </a>
              </div>
              <div className="-ml-px w-0 flex-1 flex">
                <a
                  href='#'
                  className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500"
                >
                  <ArchiveIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  {votedData[proposal.id] ? (
                    <Tooltip trigger="hover" content={`You voted ${votedData[proposal.id].choice} with ${formatNumber(votedData[proposal.id].score)} (${(votedData[proposal.id].score*100/proposal.scores_total).toFixed()}% of total votes)`}>
                      <span className="ml-3">Revote</span>
                    </Tooltip>
                  ) : (
                    <span className="ml-3">Vote</span>
                  )
                  }
                </a>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
