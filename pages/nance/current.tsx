import Link from "next/link"
import ResolvedProject from "../../components/ResolvedProject"
import SiteNav from "../../components/SiteNav"
import { Proposal } from "../../models/NanceTypes"
import { UsersIcon, CalendarIcon, DocumentTextIcon, ChatIcon } from '@heroicons/react/solid'
import { format } from "date-fns"

export async function getStaticProps() {
    const res = await fetch("https://nance-api.up.railway.app/notion/juicebox/query/vote")
    const proposals: Proposal[] = await res.json()
  
    // By returning { props: { posts } }, the Blog component
    // will receive `posts` as a prop at build time
    return {
      props: {
        proposals,
      },
    }
  }

export default function NanceCurrentProposals({ proposals }: {proposals: Proposal[]}) {

  return (
    <>
      <SiteNav pageTitle="Current proposal on Nance" description="Display info of current proposals on Nance." image="/images/lucky_demo.png" />
      <div className="m-4 lg:m-6 flex flex-col justify-center">
        <p className="text-center text-xl font-bold text-gray-600">
          Current Proposals {proposals?.[0]?.governanceCycle && `of GC${proposals[0].governanceCycle}`}
        </p>
        <ResolvedProject version={1} projectId={1} style="text-center mt-1" />
        <ResolvedProject version={2} projectId={1} style="text-center mt-1" />

        <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
                {proposals.map((proposal) => (
                <li key={proposal.hash}>
                    <Link href={`/snapshot/jbdao.eth/proposal/${proposal.voteURL.slice(42)}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                            <p className="truncate text-sm font-medium text-indigo-600 hover:underline">{`${proposal.proposalId} - ${proposal.title}`}</p>
                            <div className="ml-2 flex flex-shrink-0">
                                <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                    {proposal.status}
                                </p>
                            </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                    <UsersIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                    {proposal.category}
                                </p>
                                <Link href={proposal.url}>      
                                    <a target="_blank" rel="noopener noreferrer"
                                        className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6"
                                    >
                                        <DocumentTextIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                        Notion
                                    </a>
                                </Link>
                                <Link href={proposal.discussionThreadURL}>      
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
                                    Created on <time dateTime={proposal.date}>{format(new Date(proposal.date), 'MMMM d, yyyy')}</time>
                                </p>
                            </div>
                            </div>
                        </div>
                    </Link>
                </li>
                ))}
            </ul>
        </div>

        <div className="flex justify-end mt-6">
            <Link
                href={{
                    pathname: '/nance/new',
                    query: { type: 'Payout', version: 1, project: 1 },
                }}
            >
                <a
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    New Proposal
                </a>
            </Link>
        </div>
      </div>
    </>
  )
}