import Link from "next/link"
import SiteNav from "../../components/SiteNav"
import { UsersIcon, CalendarIcon, DocumentTextIcon, ChatIcon } from '@heroicons/react/solid'
import { format } from "date-fns"
import { useQueryParam, NumberParam } from "next-query-params"
import { useRouter } from "next/router"
import { getLastSlash } from "../../libs/nance"
import { useProposalsQuery, useSpaceInfo } from "../../hooks/NanceHooks"

export default function NanceProposals() {
    const router = useRouter();
    const { space } = router.query;
    const [cycle, setCycle] = useQueryParam<number>('cycle', NumberParam);
    const { data: infoData, isLoading: infoLoading, error: infoError} =  useSpaceInfo({ space: space as string }, router.isReady);
    const { data: proposalData, isLoading: proposalsLoading, error: proposalError }  = useProposalsQuery({ space: space as string, cycle }, router.isReady);
    const currentCycle = cycle || infoData?.data?.currentCycle;

  return (
    <>
      <SiteNav pageTitle="Current proposal on Nance" description="Display info of current proposals on Nance." image="/images/opengraph/nance_current_demo.png" />
      <div className="m-4 lg:m-6 flex justify-center lg:px-20">
        <div className="flex flex-col max-w-7xl w-full">

            <p className="text-center text-xl font-bold text-gray-600">
                { infoLoading ? `Loading space ${space}...` : infoError
                    ? `Error loading space ${space}` 
                    : `GC${currentCycle} Proposals of ${space}` }
            </p>

            <div className="flex justify-end mt-6">
                <Link
                    href={{
                        pathname: `/nance/${space as string}/new`,
                        query: { type: 'Payout', version: 2, project: 1 },
                    }}
                >
                    <a
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        New Proposal
                    </a>
                </Link>
            </div>

            <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-md">
                { (infoLoading || proposalsLoading) && <p>loading...</p>}
                <ul role="list" className="divide-y divide-gray-200">
                    {proposalData?.data?.map((proposal) => (
                        <li key={proposal.hash}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <Link href={proposal?.voteURL ? `/snapshot/jbdao.eth/proposal/${getLastSlash(proposal.voteURL)}` : `/nance/${space as string}/proposal/${proposal.hash}`}>
                                        <a className="break-words text-sm font-medium text-indigo-600 hover:underline">
                                            {`${(proposal.proposalId !== '') ? proposal.proposalId : '#TBD'} - ${proposal.title}`}
                                        </a>
                                    </Link>
                                
                                    <div className="ml-2 flex flex-shrink-0">
                                        {proposal.status === 'Discussion' && (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                Discussion
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
                                        {(proposal.status !== 'Discussion' && proposal.status !== 'Approved' && proposal.status !== 'Cancelled') && (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                {proposal.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                    {proposal.type && (
                                        <p className="flex items-center text-sm text-gray-500">
                                            <UsersIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                            {proposal.type}
                                        </p>
                                    )}
                                    <Link href={proposal.url ?? '#'}>      
                                        <a target="_blank" rel="noopener noreferrer"
                                            className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6 sm:first:ml-0"
                                        >
                                            <DocumentTextIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                            Notion
                                        </a>
                                    </Link>
                                    <Link href={proposal.discussionThreadURL ?? '#'}>      
                                        <a target="_blank" rel="noopener noreferrer"
                                            className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6"
                                        >
                                            <ChatIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                            Discord
                                        </a>
                                    </Link>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                    <p>
                                        Created on <time dateTime={proposal.date}>{proposal.date ? format(new Date(proposal.date), 'MMMM d, yyyy') : "Unknown"}</time>
                                    </p>
                                </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-6">
                <div className="flex flex-1 justify-end">
                    <button
                        disabled={cycle === 1}
                        onClick={() => setCycle(currentCycle - 1)}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                        Previous
                    </button>
                    <button
                        onClick={() => setCycle(currentCycle + 1)}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                        Next
                    </button>
                </div>
            </div>

        </div>
      </div>
    </>
  )
}