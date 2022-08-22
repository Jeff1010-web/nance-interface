import { ExternalLinkIcon, ArchiveIcon } from '@heroicons/react/solid'
import { ProposalDataExtended } from '../hooks/ProposalsExtendedOf'
import { fromUnixTime, formatDistanceToNow, isPast } from 'date-fns'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

export default function ProposalCards({spaceId, proposals}: {spaceId: string, proposals: ProposalDataExtended[]}) {

  return (
    <ul role="list" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {proposals.map((proposal) => (
        <li key={proposal.id} className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
          <div className="w-full flex items-center justify-between p-6 space-x-6">
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center space-x-3 break-words">
                <h3 className="text-gray-900 text-lg font-medium">{proposal.title}</h3>
                <div className='min-w-fit'>
                  {proposal.state == 'active' ? 
                      (<span className="flex-shrink-0 inline-block px-2 py-0.5 text-green-800 text-xs font-medium bg-green-100 rounded-full">
                          Active
                      </span>) :
                      (<span className="flex-shrink-0 inline-block px-2 py-0.5 text-gray-800 text-xs font-medium bg-gray-100 rounded-full">
                          Closed
                      </span>)
                  }
                </div>
              </div>
              <p className="mt-1 text-gray-500 text-sm break-words line-clamp-3">{proposal.body}</p>
            </div>
          </div>
          <div className="w-full">
            <dl className="m-2 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">End</dt>
                <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{formatDistanceToNow(fromUnixTime(proposal.end), { addSuffix: true })}</dd>
              </div>
              <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Votes</dt>
                <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{proposal.votes}</dd>
              </div>
              <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Quorum</dt>
                <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{formatNumber(proposal.scores_total)}/{formatNumber(proposal.quorum)}</dd>
              </div>
              {proposal.choices.map((choice) => (
                <div key={`${proposal.id}-${choice}`} className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">{choice}</dt>
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
                  <span className="ml-3">Vote</span>
                </a>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
