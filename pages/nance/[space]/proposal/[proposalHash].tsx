import { useRouter } from "next/router";
import SiteNav from "../../../../components/SiteNav";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useProposalRequest } from "../../../../hooks/NanceHooks";

export default function SnapshotProposal() {
    // router
    const router = useRouter();
    const { space, proposalHash } = router.query;
    const { data: { data: proposalData }, isLoading, error } = useProposalRequest({ space: space as string, hash: proposalHash as string }, router.isReady);

    return (
        <>
            <SiteNav pageTitle={`${space as string} proposal: ${proposalHash as string}`} description="Proposal content on Nance." image="/images/unsplash_voting.jpeg" />

            <div className="min-h-full">
                <main className="py-10">
                    {/* Page header */}
                    <div className="max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-start md:space-x-5 lg:max-w-7xl lg:px-8">
                        <div className="flex items-center space-x-5">
                            <div className="flex-shrink-0">
                                <div className="relative">
                                {/* <img
                                    className="h-16 w-16 rounded-full"
                                    src={`https://cdn.stamp.fyi/space/${space}?s=160`}
                                    alt=""
                                /> */}
                                <span className="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{proposalData.proposalId} - {proposalData.title}</h1>
                                <p className="text-sm font-medium text-gray-500">
                                {/* By&nbsp; */}
                                {/* {data?.proposalData.author ? (<FormattedAddress address={data?.proposalData.author} style="text-gray-900" />) : 'Anon'} */}
                                {/* &nbsp;on <time dateTime={proposalData?.data.created ? fromUnixTime(data?.proposalData.created).toString() : ''}>{data?.proposalData.created && format(fromUnixTime(data?.proposalData.created), 'MMMM d, yyyy')}</time> */}
                                </p>
                            </div>
                        </div>
                        <div className="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
                            <Link href={`/nance/${space as string}`}>
                                <a className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                    Back
                                </a>
                            </Link>
                            {/* <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                                onClick={() => setModalIsOpen(true)}
                                disabled={data?.proposalData?.state !== 'active' || !address}>

                                {(data?.proposalData?.state !== 'active' || !address) ? (
                                    <Tooltip trigger="hover" content={data?.proposalData?.state !== 'active' ? "Proposal is not active" : !address ? "You haven't connected wallet" : "Proposal is active and you can vote on it"}>
                                    <span>{data?.votedData ? "Revote" : "Vote"}</span>
                                    </Tooltip>
                                ) : (<span>{data?.votedData ? "Revote" : "Vote"}</span>)}
                            </button>
                            {data?.proposalData?.choices && (
                                <VotingModal modalIsOpen={modalIsOpen} closeModal={() => setModalIsOpen(false)} address={address} spaceId={space as string} proposal={data?.proposalData} />
                            )} */}
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
                                            {proposalData && <ReactMarkdown>{proposalData?.body}</ReactMarkdown>}
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