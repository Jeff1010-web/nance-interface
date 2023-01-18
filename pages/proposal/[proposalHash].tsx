import { useRouter } from "next/router";
import SiteNav from "../../components/SiteNav";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useProposalRequest } from "../../hooks/NanceHooks";
import remarkGfm from 'remark-gfm';

export default function SnapshotProposal() {
    // router
    const router = useRouter();
    const { space, proposalHash } = router.query;
      
    const { data, isLoading, error } = useProposalRequest({ space: space as string, hash: proposalHash as string }, router.isReady);
    const proposalData = data?.data;

    return (
        <>
            <SiteNav pageTitle={`${proposalData?.title || proposalHash as string} | ${space as string} proposal`} description="Proposal content on Nance." image="/images/unsplash_voting.jpeg" />

            <div className="min-h-full flex justify-center">
                <main className="py-10">
                    {/* Page header */}
                    <div className="max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-start md:space-x-5 lg:max-w-7xl lg:px-8">
                        <div className="flex items-center space-x-5">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{proposalData?.proposalId|| '#TBD'} - {proposalData?.title}</h1>
                            </div>
                        </div>
                        <div className="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
                            <Link href={`/`}>
                                <a className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                    Back
                                </a>
                            </Link>

                            <Link href={proposalData?.url ?? '#'}>
                                <a target="_blank" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                    Edit
                                </a>
                            </Link>

                            <Link href={proposalData?.discussionThreadURL ?? '#'}>
                                <a target="_blank" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                    Vote
                                </a>
                            </Link>
                        </div>
                    </div>

                    <div className="mx-auto mt-8 grid grid-cols-1 gap-6 sm:px-6 lg:grid-flow-col-dense lg:grid-cols-2">
                        <div className="space-y-6 lg:col-span-2 lg:col-start-1">
                            {/* Description list*/}
                            <section aria-labelledby="applicant-information-title">
                                <div className="bg-white shadow sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6 flex space-x-3">
                                        <h2 id="applicant-information-title" className="text-lg font-medium leading-6 text-gray-900">
                                            Proposal
                                        </h2>
                                    </div>
                                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                        <article className="prose prose-lg prose-indigo mx-auto mt-6 text-gray-500 break-words">
                                            {isLoading && 'Loading...'}
                                            {error && 'Error.'}
                                            {proposalData && <ReactMarkdown remarkPlugins={[remarkGfm]}>{proposalData?.body}</ReactMarkdown>}
                                        </article>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}