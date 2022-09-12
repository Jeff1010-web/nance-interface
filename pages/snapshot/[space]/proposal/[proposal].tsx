import { useRouter } from "next/router";
import { useProposalExtendedOf, VoteData } from "../../../../hooks/ProposalsExtendedOf";
import { useAccount } from 'wagmi'
import SiteNav from "../../../../components/SiteNav";
import useSpaceInfo from "../../../../hooks/SpaceInfo";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Tooltip } from 'flowbite-react';

import FormattedAddress from "../../../../components/FormattedAddress";
import { formatDistanceToNow, fromUnixTime, format } from "date-fns";
import { useState } from "react";
import VotingModal from "../../../../components/VotingModal";

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

export default function SnapshotProposal() {
    // router
    const router = useRouter();
    const { space, proposal } = router.query;
    // external hook
    const { address, isConnected } = useAccount();
    const { data: spaceInfo } = useSpaceInfo(space as string);
    // load data
    const { loading, data, error } = useProposalExtendedOf(proposal as string, address);
    // state
    const [modalIsOpen, setModalIsOpen] = useState(false);

    return (
        <>
            <SiteNav pageTitle={`${spaceInfo?.name || (space as string) || ''} proposal: ${data?.proposalData.title}`} description="Snapshot voting with filter, search bar and quick overview on single page." image="/images/unsplash_voting.jpeg" />

            <div className="min-h-full">
                <main className="py-10">
                {/* Page header */}
                <div className="mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
                    <div className="flex items-center space-x-5">
                    <div className="flex-shrink-0">
                        <div className="relative">
                        <img
                            className="h-16 w-16 rounded-full"
                            src={`https://cdn.stamp.fyi/space/${space}?s=160`}
                            alt=""
                        />
                        <span className="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{data?.proposalData.title}</h1>
                        <p className="text-sm font-medium text-gray-500">
                        By&nbsp;
                        {data?.proposalData.author ? (<FormattedAddress address={data?.proposalData.author} style="text-gray-900" />) : 'Anon'}
                        &nbsp;on <time dateTime={data?.proposalData.created ? fromUnixTime(data?.proposalData.created).toString() : ''}>{data?.proposalData.created && format(fromUnixTime(data?.proposalData.created), 'MMMM d, yyyy')}</time>
                        </p>
                    </div>
                    </div>
                    <div className="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
                        <Link href={`/snapshot/${space}`}>
                            <a className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                Back
                            </a>
                        </Link>
                        <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
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
                        )}
                    </div>
                </div>

                <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2 lg:col-start-1">
                    {/* Description list*/}
                    <section aria-labelledby="applicant-information-title">
                        <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 flex space-x-3">
                            <h2 id="applicant-information-title" className="text-lg font-medium leading-6 text-gray-900">
                                Proposal
                            </h2>
                            {/* Proposal status */}
                            <div className='min-w-fit'>
                            {data?.proposalData.state === 'active' && labelWithTooltip('Active', 'Ends ' + formatDistanceToNow(fromUnixTime(data?.proposalData.end), { addSuffix: true }), 'text-green-800 bg-green-100')}
                            {data?.proposalData.state === 'pending' && labelWithTooltip('Pending', 'This proposal is currently pending and not open for votes.', 'text-yellow-800 bg-yellow-100')}
                            {data?.proposalData.state === 'closed' && labelWithTooltip('Closed', formatDistanceToNow(fromUnixTime(data?.proposalData.end), { addSuffix: true }), 'text-gray-800 bg-gray-100')}
                            </div>
                            {/* <p className="mt-1 max-w-2xl text-sm text-gray-500">Proposal details.</p> */}
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <article className="prose prose-lg prose-indigo mx-auto mt-6 text-gray-500 break-words">
                                <ReactMarkdown>{data?.proposalData.body}</ReactMarkdown>
                            </article>
                        </div>
                        <div>
                            <Link href={`https://snapshot.org/#/${space}/proposal/${proposal}`}>
                                <a className="block bg-gray-50 px-4 py-4 text-center text-sm font-medium text-gray-500 hover:text-gray-700 sm:rounded-b-lg">
                                    Read on Snapshot
                                </a>
                            </Link>
                        </div>
                        </div>
                    </section>

                    {/* Votes */}
                    <section aria-labelledby="votes-title" className={data?.proposalData?.state == 'pending' && 'hidden'}>
                        <div className="bg-white shadow sm:overflow-hidden sm:rounded-lg">
                        <div className="divide-y divide-gray-200">
                            <div className="px-4 py-5 sm:px-6">
                            <h2 id="notes-title" className="text-lg font-medium text-gray-900">
                                Votes
                                <span className='bg-indigo-100 text-indigo-600 hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'>
                                    {data?.proposalData?.votes}
                                </span>
                            </h2>
                            </div>
                            <div className="px-4 py-6 sm:px-6">
                                <ul role="list" className="space-y-8">
                                    {data?.votesData?.map((vote: VoteData) => (
                                    <li key={vote.id}>
                                        <div className="flex space-x-3">
                                            <div className="flex-shrink-0">
                                                <img className="h-10 w-10 rounded-full"
                                                    src={`https://cdn.stamp.fyi/avatar/${vote.voter}?s=160`}
                                                    alt={`avatar of ${vote.voter}`}
                                                />
                                            </div>
                                            <div>
                                                <div className="text-sm">
                                                    <FormattedAddress address={vote.voter} style="font-medium text-gray-900" />
                                                    &nbsp;<span className="italic">{vote.choice}</span>
                                                    &nbsp;<span className="underline">{formatNumber(vote.score)}</span>
                                                </div>
                                                <div className="mt-1 text-sm text-gray-700">
                                                <p>{vote.reason}</p>
                                                </div>
                                                <div className="mt-2 space-x-2 text-sm">
                                                    <span className="font-medium text-gray-500">
                                                        {formatDistanceToNow(fromUnixTime(vote.created), { addSuffix: true })}
                                                    </span>{' '}
                                                    {/* <span className="font-medium text-gray-500">&middot;</span>{' '}
                                                    <button type="button" className="font-medium text-gray-900">
                                                        IPFS
                                                    </button> */}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        </div>
                    </section>
                    </div>

                    <section aria-labelledby="stats-title" className="lg:col-span-1 lg:col-start-3">
                    <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
                        <h2 id="timeline-title" className="text-lg font-medium text-gray-900">
                        Stats
                        </h2>

                        <div className="mt-6 flow-root">
                            <dl className="m-2 grid grid-cols-2 gap-5">
                                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Scores</dt>
                                    <Tooltip
                                        content={data?.proposalData.quorum>0 && `(${(data?.proposalData.scores_total*100/data?.proposalData.quorum).toFixed()}% of quorum)`}
                                        trigger="hover"
                                    >
                                        <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{formatNumber(data?.proposalData.scores_total)}</dd>
                                    </Tooltip>
                                </div>
                                {/* Vote choice data */}
                                {data?.proposalData.scores_total > 0 && data?.proposalData?.choices?.filter((choice) => data?.proposalData.voteByChoice[choice]>0).map((choice) => (
                                    <div key={`${data?.proposalData.id}-${choice}`} className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                                        <Tooltip
                                            content={choice}
                                            trigger="hover"
                                        >
                                            <dt className="text-sm font-medium text-gray-500 truncate">{choice}</dt>
                                        </Tooltip>
                                        <Tooltip
                                            content={formatNumber(data?.proposalData.voteByChoice[choice])}
                                            trigger="hover"
                                        >
                                            <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{(data?.proposalData.voteByChoice[choice]*100/data?.proposalData.scores_total).toFixed(2)}%</dd>
                                        </Tooltip>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                    </section>
                </div>
                </main>
            </div>
        </>
    )
}